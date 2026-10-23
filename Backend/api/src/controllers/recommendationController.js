import mongoose from 'mongoose';
import { Campaign } from '../models/Campaign.js';
import { CreatorProfile } from '../models/CreatorProfile.js';
import { categoryToCreatorType } from '../config/marketplace.js';

const getRecommenderUrl = () => (process.env.RECOMMENDER_URL || 'http://127.0.0.1:8100').replace(/\/$/, '');

const callRecommender = async (path, payload) => {
  let response;
  try {
    response = await fetch(`${getRecommenderUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    const error = new Error('Recommendation service is unavailable. Start the Python recommender and try again.');
    error.statusCode = 503;
    throw error;
  }
  if (!response.ok) {
    const error = new Error('Recommendation service could not rank these results.');
    error.statusCode = 502;
    throw error;
  }
  const result = await response.json();
  if (!Array.isArray(result.recommendations) || !['cold_start', 'two_tower'].includes(result.source)) {
    const error = new Error('Recommendation service returned an invalid response.');
    error.statusCode = 502;
    throw error;
  }
  return result;
};

const recommendationError = (response, error) => response.status(error.statusCode || 502).json({ error: error.message });

const toCreator = (profile) => ({
  id: String(profile.user._id),
  accountName: profile.user.name,
  profile: {
    creatorName: profile.creatorName,
    influencerType: profile.influencerType,
    instagramUsername: profile.instagramUsername,
    instagramFollowerCount: profile.instagramFollowerCount ?? null,
    bio: profile.bio,
  },
});

const toCampaign = (campaign) => ({
  id: String(campaign._id),
  brandId: String(campaign.brand?._id || campaign.brand),
  brandName: campaign.brand?.name || '',
  name: campaign.name,
  productCategory: campaign.productCategory,
  creatorType: campaign.creatorType,
  objective: campaign.objective,
  minFollowers: campaign.minFollowers,
  maxFollowers: campaign.maxFollowers,
  budget: campaign.budget ?? null,
  status: campaign.status,
});

export const recommendCreators = async (request, response) => {
  const { campaignId } = request.query;
  if (!mongoose.isValidObjectId(campaignId)) {
    return response.status(400).json({ error: 'Choose a valid campaign to get recommendations.' });
  }
  const campaign = await Campaign.findOne({ _id: campaignId, brand: request.user._id }).lean();
  if (!campaign) return response.status(404).json({ error: 'Campaign not found.' });

  const profiles = await CreatorProfile.find()
    .populate('user', 'name role')
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();
  const creators = profiles.filter((profile) => profile.user?.role === 'Creator');
  const creatorsById = new Map(creators.map((profile) => [String(profile.user._id), profile]));
  try {
    const result = await callRecommender('/recommendations/creators', {
      campaign: {
        id: String(campaign._id),
        product_category: campaign.productCategory,
        target_creator_types: [categoryToCreatorType[campaign.productCategory] || campaign.creatorType],
        follower_min: campaign.minFollowers,
        follower_max: campaign.maxFollowers,
      },
      creators: creators.map((profile) => ({
        id: String(profile.user._id),
        influencer_type: profile.influencerType,
        follower_count: profile.instagramFollowerCount ?? null,
      })),
      limit: 100,
    });
    return response.json({
      source: result.source,
      recommendations: result.recommendations.flatMap((item) => {
        const profile = creatorsById.get(item.candidateId);
        return profile ? [{ ...item, creator: toCreator(profile) }] : [];
      }),
    });
  } catch (error) {
    return recommendationError(response, error);
  }
};

export const recommendCampaigns = async (request, response) => {
  const profile = await CreatorProfile.findOne({ user: request.user._id }).lean();
  if (!profile) return response.status(409).json({ error: 'Complete your creator profile to get campaign recommendations.' });

  const campaigns = await Campaign.find({ status: 'Open' })
    .populate('brand', 'name')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  const campaignsById = new Map(campaigns.map((campaign) => [String(campaign._id), campaign]));
  try {
    const result = await callRecommender('/recommendations/campaigns', {
      creator: {
        id: String(request.user._id),
        influencer_type: profile.influencerType,
        follower_count: profile.instagramFollowerCount ?? null,
      },
      campaigns: campaigns.map((campaign) => ({
        id: String(campaign._id),
        product_category: campaign.productCategory,
        target_creator_types: [categoryToCreatorType[campaign.productCategory] || campaign.creatorType],
        follower_min: campaign.minFollowers,
        follower_max: campaign.maxFollowers,
      })),
      limit: 100,
    });
    return response.json({
      source: result.source,
      recommendations: result.recommendations.flatMap((item) => {
        const campaign = campaignsById.get(item.candidateId);
        return campaign ? [{ ...item, campaign: toCampaign(campaign) }] : [];
      }),
    });
  } catch (error) {
    return recommendationError(response, error);
  }
};
