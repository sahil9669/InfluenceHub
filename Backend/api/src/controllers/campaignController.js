import mongoose from 'mongoose';
import { categoryToCreatorType, campaignCategories } from '../config/marketplace.js';
import { Campaign } from '../models/Campaign.js';

const validCategories = new Set(campaignCategories);

const toNumber = (value) => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return NaN;
  return Number(value);
};

const cleanText = (value, minLength, maxLength) => {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean.length >= minLength && clean.length <= maxLength ? clean : null;
};

const toPublicCampaign = (campaign) => ({
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
  createdAt: campaign.createdAt,
  updatedAt: campaign.updatedAt,
});

export const listCampaigns = async (request, response) => {
  const query = request.user.role === 'Brand'
    ? { brand: request.user._id }
    : request.user.role === 'Creator'
      ? { status: 'Open' }
      : {};
  const campaigns = await Campaign.find(query)
    .populate('brand', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return response.json({ campaigns: campaigns.map(toPublicCampaign) });
};

export const createCampaign = async (request, response) => {
  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'A campaign object is required.' });
  }

  const allowedFields = new Set(['name', 'productCategory', 'objective', 'minFollowers', 'maxFollowers', 'budget']);
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    return response.status(400).json({ error: 'The request contains unsupported campaign fields.' });
  }

  const name = cleanText(body.name, 2, 100);
  const objective = cleanText(body.objective, 2, 500);
  const productCategory = typeof body.productCategory === 'string' ? body.productCategory.trim() : '';
  const creatorType = categoryToCreatorType[productCategory];
  const minFollowers = toNumber(body.minFollowers);
  const maxFollowers = toNumber(body.maxFollowers);
  const budget = body.budget === '' || body.budget === null || body.budget === undefined
    ? null
    : toNumber(body.budget);

  if (!name || !objective || !validCategories.has(productCategory) || !creatorType) {
    return response.status(400).json({ error: 'Enter a campaign name, brief, and valid product category.' });
  }
  if (
    !Number.isSafeInteger(minFollowers) ||
    !Number.isSafeInteger(maxFollowers) ||
    minFollowers < 0 ||
    maxFollowers < minFollowers
  ) {
    return response.status(400).json({ error: 'Enter a valid minimum and maximum follower range.' });
  }
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
    return response.status(400).json({ error: 'Budget must be a non-negative number or left blank.' });
  }

  const campaign = await Campaign.create({
    brand: request.user._id,
    name,
    productCategory,
    creatorType,
    objective,
    minFollowers,
    maxFollowers,
    budget,
  });
  await campaign.populate('brand', 'name');
  return response.status(201).json({ campaign: toPublicCampaign(campaign) });
};

export const updateCampaignStatus = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ error: 'Invalid campaign ID.' });
  }
  const { status } = request.body ?? {};
  if (!['Open', 'Paused'].includes(status)) {
    return response.status(400).json({ error: 'Status must be Open or Paused.' });
  }

  const campaign = await Campaign.findOne({ _id: request.params.id, brand: request.user._id });
  if (!campaign) return response.status(404).json({ error: 'Campaign not found.' });

  const allowedTransition = status === 'Open'
    ? ['Draft', 'Paused'].includes(campaign.status)
    : campaign.status === 'Open';
  if (!allowedTransition) {
    return response.status(409).json({ error: 'This campaign cannot change to that status.' });
  }

  campaign.status = status;
  await campaign.save();
  await campaign.populate('brand', 'name');
  return response.json({ campaign: toPublicCampaign(campaign) });
};

