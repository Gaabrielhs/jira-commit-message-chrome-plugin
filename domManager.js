const defaultBranchName = "feature/master"

const options = {}

//Initializing the cache
chrome.storage.local.get('options', data => {
  console.log("cache initialized")
  console.log(data)
  Object.assign(options, data.options)
})

//Updating the cache in runtime
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("cache changed")
  console.log(changes)
  if (area === 'local' && changes.options?.newValue) {
    Object.assign(options, changes.options.newValue)
  }
})

const commands = [
  {
    id: "commit",
    handler: getCommitMessage
  },
  {
    id: "branch",
    handler: getBranchName
  }
]

function getCommitMessage(sendResponse) {
  const key = getJiraKey()
  const title = getJiraTitle()
  let response = `[${key}] ${title}`

  if(options.copyGitCommand) {
    response = `git commit -m "${response}"`
  }
  sendResponse(response);
}

function getBranchName(sendResponse) {
  const key = getJiraKey()
  let response = `${defaultBranchName}/${key}`
  if(options.copyGitCommand) {
    response = `git checkout -b ${response}` 
  }
  sendResponse(response);
}

function getJiraTitle() {
  const title = document.querySelector(
    '[data-test-id="issue.views.issue-base.foundation.summary.heading"]'
  ).innerHTML;

  return title
}

function getJiraKey() {
  const linkSplitted = document.querySelector('[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] a')
    .href.split("/");

  return linkSplitted[linkSplitted.length - 1];
}

chrome.runtime.onMessage.addListener(({ message }, _, sendResponse) => {
  console.log(`message received ${message}`)
  const command = commands.find((command) => command.id == message)
  console.log(command)
  if(command == null) return
  command.handler(sendResponse)
});