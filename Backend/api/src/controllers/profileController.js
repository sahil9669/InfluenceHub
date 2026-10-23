import mongoose from 'mongoose';
import { BrandProfile } from '../models/BrandProfile.js';
import { CreatorProfile } from '../models/CreatorProfile.js';
import { User } from '../models/User.js';
import { creatorTypes } from '../config/marketplace.js';

const creatorFields = ['creatorName', 'influencerType', 'instagramUsername', 'website', 'bio'];
const brandFields = ['organizationName', 'website', 'bio'];
const creatorTypeSet = new Set(creatorTypes);

const cleanText = (value, maxLength, { required = false } = {}) => {
  if (typeof value !== 'string') return required ? null : '';
  const clean = value.trim();
  if ((required && clean.length < 2) || clean.length > maxLength) return null;
  return clean;
};

const cleanWebsite = (value) => {
  const website = cleanText(value, 200);
  if (website === null) return null;
  if (!website) return '';
  try {
    const parsed = new URL(website);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const profileDetails = (profile, role) => {
  if (!profile) return null;
  const fields = role === 'Creator' ? creatorFields : brandFields;
  return {
    ...Object.fromEntries(fields.map((field) => [field, profile[field] ?? ''])),
    ...(role === 'Creator' ? {
      instagramFollowerCount: profile.instagramFollowerCount ?? null,
      instagramFollowerCountUpdatedAt: profile.instagramFollowerCountUpdatedAt ?? null,
    } : {}),
  };
};

const toMyProfile = (profile, role) => profile
  ? { id: String(profile._id), ...profileDetails(profile, role) }
  : null;

const toMarketplaceProfile = (account, profile) => ({
  id: String(account._id),
  accountName: account.name,
  role: account.role,
  profile: profileDetails(profile, account.role),
});

export const getMyProfile = async (request, response) => {
  const Model = request.user.role === 'Creator' ? CreatorProfile : BrandProfile;
  const profile = await Model.findOne({ user: request.user._id }).lean();
  return response.json({ profile: toMyProfile(profile, request.user.role) });
};

export const saveMyProfile = async (request, response) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({ error: 'A profile object is required.' });
  }

  const fields = request.user.role === 'Creator' ? creatorFields : brandFields;
  if (Object.keys(request.body).some((field) => !fields.includes(field))) {
    return response.status(400).json({ error: 'The request contains unsupported profile fields.' });
  }

  let values;
  if (request.user.role === 'Creator') {
    const influencerType = request.body.influencerType;
    if (!creatorTypeSet.has(influencerType)) {
      return response.status(400).json({ error: 'Choose a valid creator type.' });
    }

    const creatorName = cleanText(request.body.creatorName, 100);
    const rawUsername = request.body.instagramUsername;
    const instagramUsername = typeof rawUsername === 'string'
      ? rawUsername.trim().replace(/^@/, '').toLowerCase()
      : '';
    const website = cleanWebsite(request.body.website);
    const bio = cleanText(request.body.bio, 400);
    if (
      creatorName === null ||
      instagramUsername.length > 30 ||
      !/^[a-z0-9._]*$/.test(instagramUsername) ||
      website === null ||
      bio === null
    ) {
      return response.status(400).json({ error: 'Check the creator name, Instagram username, website URL, and bio length.' });
    }
    values = { creatorName, influencerType, instagramUsername, website, bio };
  } else {
    const organizationName = cleanText(request.body.organizationName, 120, { required: true });
    const website = cleanWebsite(request.body.website);
    const bio = cleanText(request.body.bio, 400);
    if (organizationName === null || website === null || bio === null) {
      return response.status(400).json({ error: 'Enter an organization name and check the website URL and bio length.' });
    }
    values = { organizationName, website, bio };
  }

  const Model = request.user.role === 'Creator' ? CreatorProfile : BrandProfile;
  const profile = await Model.findOneAndUpdate(
    { user: request.user._id },
    { $set: values, $setOnInsert: { user: request.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return response.json({ profile: toMyProfile(profile, request.user.role) });
};

export const listCreatorProfiles = async (_request, response) => {
  const profiles = await CreatorProfile.find()
    .populate('user', 'name role')
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  const publicProfiles = profiles
    .filter((profile) => profile.user)
    .map((profile) => toMarketplaceProfile(profile.user, profile));
  return response.json({ profiles: publicProfiles });
};

export const getMarketplaceProfile = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.userId)) {
    return response.status(404).json({ error: 'Profile not found.' });
  }
  const account = await User.findById(request.params.userId).select('name role').lean();
  if (!account || !['Brand', 'Creator'].includes(account.role)) {
    return response.status(404).json({ error: 'Profile not found.' });
  }

  const Model = account.role === 'Creator' ? CreatorProfile : BrandProfile;
  const profile = await Model.findOne({ user: account._id }).lean();
  return response.json({ profile: toMarketplaceProfile(account, profile) });
};
