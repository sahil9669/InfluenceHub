import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Campaign } from '../models/Campaign.js';
import { CreatorProfile } from '../models/CreatorProfile.js';
import { Collaboration } from '../models/Collaboration.js';

const toPublicApplication = (application) => ({
  id: String(application._id),
  status: application.status,
  message: application.message,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
  campaign: application.campaign ? {
    id: String(application.campaign._id),
    name: application.campaign.name,
    productCategory: application.campaign.productCategory,
    creatorType: application.campaign.creatorType,
    brandId: String(application.campaign.brand?._id || application.campaign.brand),
    brandName: application.campaign.brand?.name || '',
  } : null,
  creator: application.creator ? {
    id: String(application.creator._id),
    name: application.creator.name,
    profile: application.creatorProfile ? {
      creatorName: application.creatorProfile.creatorName,
      influencerType: application.creatorProfile.influencerType,
      instagramUsername: application.creatorProfile.instagramUsername,
      instagramFollowerCount: application.creatorProfile.instagramFollowerCount ?? null,
      bio: application.creatorProfile.bio,
    } : null,
  } : null,
});

const populateApplication = (query) => query
  .populate({ path: 'campaign', select: 'name productCategory creatorType brand', populate: { path: 'brand', select: 'name' } })
  .populate('creator', 'name')
  .populate({ path: 'creatorProfile', select: 'creatorName influencerType instagramUsername instagramFollowerCount bio' });

export const listApplications = async (request, response) => {
  let query = {};
  if (request.user.role === 'Creator') {
    query.creator = request.user._id;
  } else if (request.user.role === 'Brand') {
    const campaignIds = await Campaign.find({ brand: request.user._id }).distinct('_id');
    query.campaign = { $in: campaignIds };
  }

  const applications = await populateApplication(
    Application.find(query).sort({ createdAt: -1 }).limit(200)
  ).lean();

  return response.json({ applications: applications.map(toPublicApplication) });
};

export const createApplication = async (request, response) => {
  const { campaignId, message } = request.body ?? {};
  if (!mongoose.isValidObjectId(campaignId)) {
    return response.status(400).json({ error: 'Choose a valid campaign.' });
  }
  if (typeof message !== 'string' || message.trim().length < 2 || message.trim().length > 1000) {
    return response.status(400).json({ error: 'Write a message between 2 and 1000 characters.' });
  }

  const [campaign, creatorProfile] = await Promise.all([
    Campaign.findOne({ _id: campaignId, status: 'Open' }).select('_id'),
    CreatorProfile.findOne({ user: request.user._id }),
  ]);
  if (!campaign) return response.status(404).json({ error: 'This campaign is no longer open.' });
  if (!creatorProfile) return response.status(409).json({ error: 'Complete your creator profile before applying.' });

  try {
    const application = await Application.create({
      campaign: campaign._id,
      creator: request.user._id,
      creatorProfile: creatorProfile._id,
      message: message.trim(),
    });
    const result = await populateApplication(Application.findById(application._id)).lean();
    return response.status(201).json({ application: toPublicApplication(result) });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ error: 'You have already applied to this campaign.' });
    }
    throw error;
  }
};

export const updateApplicationStatus = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ error: 'Invalid application ID.' });
  }
  const { status } = request.body ?? {};
  if (!['Accepted', 'Declined'].includes(status)) {
    return response.status(400).json({ error: 'Status must be Accepted or Declined.' });
  }

  const application = await Application.findById(request.params.id).populate('campaign', 'brand');
  if (!application || String(application.campaign?.brand) !== String(request.user._id)) {
    return response.status(404).json({ error: 'Application not found.' });
  }
  if (application.status !== 'Pending') {
    return response.status(409).json({ error: 'Only pending applications can be reviewed.' });
  }

  let collaboration;
  if (status === 'Accepted') {
    try {
      collaboration = await Collaboration.create({
        application: application._id,
        campaign: application.campaign._id,
        brand: application.campaign.brand,
        creator: application.creator,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return response.status(409).json({ error: 'A collaboration already exists for this application.' });
      }
      throw error;
    }
  }

  let updatedApplication;
  try {
    updatedApplication = await Application.findOneAndUpdate(
      { _id: application._id, status: 'Pending' },
      { $set: { status } },
      { new: true }
    );
  } catch (error) {
    if (collaboration) await Collaboration.deleteOne({ _id: collaboration._id });
    throw error;
  }
  if (!updatedApplication) {
    if (collaboration) await Collaboration.deleteOne({ _id: collaboration._id });
    return response.status(409).json({ error: 'This application has already been reviewed.' });
  }

  const result = await populateApplication(Application.findById(application._id)).lean();
  return response.json({ application: toPublicApplication(result), collaborationId: collaboration ? String(collaboration._id) : null });
};
