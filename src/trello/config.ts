export type TrelloConfig = {
  key?: string
  token?: string
  boardId?: string
  inProgressListId?: string
  pendingListId?: string
  doneListId?: string
}

export let config: TrelloConfig = {
  key: process.env.TOODOO_TRELLO_KEY,
  token: process.env.TOODOO_TRELLO_TOKEN,
  boardId: process.env.TOODOO_TRELLO_BOARD_ID,
  inProgressListId: process.env.TOODOO_TRELLO_INPROGRESS_LIST_ID,
  pendingListId: process.env.TOODOO_TRELLO_PENDING_LIST_ID,
  doneListId: process.env.TOODOO_TRELLO_DONE_LIST_ID
}
