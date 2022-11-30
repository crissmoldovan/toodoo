import { HTTPMethod } from 'http-method-enum'
import fetch from 'isomorphic-unfetch'
import { config } from '../../config'

export type TrelloCard = {
  id: string
  name: string
  desc: string
  idList: string
  idBoard: string
  idMembers: string[]
  labels: string[]
  url: string
  shortUrl: string
  pos: number
  due: string
  dueComplete: boolean
  closed: boolean
  subscribed: boolean
  dateLastActivity: string
  idShort: number
  shortLink: string
  manualCoverAttachment: boolean
  idAttachmentCover: string
  attachments: string[]
  attachmentCover: string
  checkItemStates: string[]
  checklists: string[]
  comments: string[]
  descriptionData: string
  dueReminder: string
  idLabels: string[]
  labelsData: string[]
  members: string[]
  membersVoted: string[]
  pluginData: string[]
  subscribedData: string[]
  customFieldItems: string[]
  board: string
  list: string
  memberships: string[]
  stickers: string[]
  cover: string
  badges: string[]
  limits: string[]
  locationName: string
  location: string
  isTemplate: boolean
  cardRole: string
  creationMethod: string
  start: string
  descData: string
  email: string
}

export type TrelloList = {
  id: string
  name: string
  closed: boolean
  idBoard: string
  pos: number
  subscribed: boolean
  softLimit: string
  creationMethod: string
  limits: string
  shortUrl: string
}

export type TrelloBoard = {
  id: string
  name: string
  desc: string
  descData: string
  closed: boolean
  idOrganization: string
  pinned: boolean
  url: string
  shortUrl: string
  prefs: string
  labelNames: string
  powerUps: string[]
  dateLastActivity: string
  dateLastView: string
  shortLink: string
  idTags: string[]
  datePluginDisable: string
  creationMethod: string
  idMembers: string[]
  idLabels: string[]
  idCardSource: string
  idEnterprise: string
  enterpriseOwned: boolean
  limits: string
  starred: boolean
  memberships: string[]
}

export type TrelloMember = {
  id: string
  avatarHash: string
  bio: string
  bioData: string
  confirmed: boolean
  fullName: string
  idPremOrgsAdmin: string[]
  initials: string
  memberType: string
  products: string[]
  status: string
  url: string
  username: string
  avatarSource: string
  email: string
  gravatarHash: string
  idBoards: string[]
  idOrganizations: string[]
  loginTypes: string[]
  newEmail: string
  oneTimeMessagesDismissed: string[]
  prefs: string
  trophies: string[]
  uploadedAvatarHash: string
  uploadedAvatarUrl: string
  premiumFeatures: string[]
  idEnterprisesAdmin: string[]
  enterpriseMemberType: string
  idBoardsInvited: string[]
  idBoardsPinned: string[]
  idOrganizationsInvited: string[]
  idEnterprises: string[]
  idEnterprisesInvited: string[]
  limits: string
  marketingOptIn: string
  messagesDismissed: string[]
  nonPublic: string
  nonPublicAvailable: string
}

export const makeRequest = async (
  method: HTTPMethod,
  path: string,
  data?: any
): Promise<any> => {
  const url = `https://api.trello.com/1${path}?key=${config.trello?.key}&token=${config.trello?.token}`

  const response = await fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const res = await response.json()

  return res
}

export const getBoards = async (): Promise<TrelloBoard[]> =>
  await makeRequest(HTTPMethod.GET, '/members/me/boards')

export const getBoard = async (boardId: string): Promise<TrelloBoard> =>
  await makeRequest(HTTPMethod.GET, `/boards/${boardId}`)

export const getLists = async (boardId: string): Promise<TrelloList[]> =>
  await makeRequest(HTTPMethod.GET, `/boards/${boardId}/lists`)

export const getList = async (listId: string): Promise<TrelloList> =>
  await makeRequest(HTTPMethod.GET, `/lists/${listId}`)

export const getCards = async (listId: string): Promise<TrelloCard[]> =>
  await makeRequest(HTTPMethod.GET, `/lists/${listId}/cards`)

export const getCard = async (cardId: string): Promise<TrelloCard> =>
  await makeRequest(HTTPMethod.GET, `/cards/${cardId}`)

export const createCard = async (
  listId: string,
  data: Partial<TrelloCard>
): Promise<TrelloCard> =>
  await makeRequest(HTTPMethod.POST, `/cards`, {
    idList: listId,
    pos: 'top',
    ...data
  })

export const moveCard = async (
  cardId: string,
  listId: string
): Promise<TrelloCard> =>
  await makeRequest(HTTPMethod.PUT, `/cards/${cardId}`, {
    idList: listId
  })

export const deleteCard = async (cardId: string): Promise<TrelloCard> =>
  await makeRequest(HTTPMethod.DELETE, `/cards/${cardId}`)

export const getProfile = async (): Promise<TrelloMember> =>
  await makeRequest(HTTPMethod.GET, '/members/me')

export const testConection = async (): Promise<boolean> =>
  !!(await getProfile())
