import { Campaign } from '../models/Campaign.js';
import { Collaboration } from '../models/Collaboration.js';
import { Application } from '../models/Application.js';

const toPublicCollaboration = (collaboration) => ({
  id: String(collaboration._id),
  status: collaboration.status,
  createdAt: collaboration.createdAt,
  updatedAt: collaboration.updatedAt,
  campaign: collaboration.campaign ? {
    id: String(collaboration.campaign._id),
    name: collaboration.campaign.name,
    productCategory: collaboration.campaign.productCategory,
    creatorType: collaboration.campaign.creatorType,
  } : null,
  brand: collaboration.brand ? {
    id: String(collaboration.brand._id),
    name: collaboration.brand.name,
  } : null,
  creator: collaboration.creator ? {
    id: String(collaboration.creator._id),
    name: collaboration.creator.name,
  } : null,
});

const populateCollaboration = (query) => query
  .populate('campaign', 'name productCategory creatorType')
  .populate('brand', 'name')
  .populate('creator', 'name');

export const listCollaborations = async (request, response) => {
  let query = {};
  if (request.user.role === 'Brand') query.brand = request.user._id;
  if (request.user.role === 'Creator') query.creator = request.user._id;

  let acceptedApplicationQuery = { status: 'Accepted' };
  if (request.user.role === 'Creator') acceptedApplicationQuery.creator = request.user._id;
  if (request.user.role === 'Brand') {
    const campaignIds = await Campaign.find({ brand: request.user._id }).distinct('_id');
    acceptedApplicationQuery.campaign = { $in: campaignIds };
  }
  const acceptedApplications = await Application.find(acceptedApplicationQuery)
    .select('_id campaign creator')
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();

  if (acceptedApplications.length) {
    const campaignIds = [...new Set(acceptedApplications.map((application) => String(application.campaign)))];
    const [existingApplicationIds, campaigns] = await Promise.all([
      Collaboration.find({ application: { $in: acceptedApplications.map((application) => application._id) } }).distinct('application'),
      Campaign.find({ _id: { $in: campaignIds } }).select('_id brand').lean(),
    ]);
    const existing = new Set(existingApplicationIds.map(String));
    const brandByCampaign = new Map(campaigns.map((campaign) => [String(campaign._id), campaign.brand]));
    const operations = acceptedApplications
      .filter((application) => !existing.has(String(application._id)) && brandByCampaign.has(String(application.campaign)))
      .map((application) => ({
        updateOne: {
          filter: { application: application._id },
          update: { $setOnInsert: {
            application: application._id,
            campaign: application.campaign,
            brand: brandByCampaign.get(String(application.campaign)),
            creator: application.creator,
            status: 'In progress',
          } },
          upsert: true,
        },
      }));
    if (operations.length) {
      try {
        await Collaboration.bulkWrite(operations, { ordered: false });
      } catch (error) {
        if (error?.code !== 11000 && !error?.writeErrors?.every((writeError) => writeError.code === 11000)) throw error;
      }
    }
  }

  const collaborations = await populateCollaboration(
    Collaboration.find(query).sort({ createdAt: -1 }).limit(200)
  ).lean();
  return response.json({ collaborations: collaborations.map(toPublicCollaboration) });
};
