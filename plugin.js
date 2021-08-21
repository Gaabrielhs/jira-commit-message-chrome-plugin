function showSuccess() {
	resultMessage.classList.remove("hide")
	setTimeout(() => {
		resultMessage.classList.add("hide")
	}, 3000)
}

function sendMessage(tabId, message) {
	return new Promise((resolve, reject) => {
		try {
			chrome.tabs.sendMessage(tabId, { message }, (response) => {
				resolve(response)
			})
		} catch (e) {
			reject(e)
		}
	})
}

const options = {}

chrome.storage.local.get('options', (data) => {
	console.log("data retrieved from storage")
	console.log(data)
	Object.assign(options, data.options)
	copyGitCommand.checked = Boolean(options.copyGitCommand);;
});

copyGitCommand.addEventListener("change", (evt) => {
	const copyGitCommand = evt.target.checked
	options.copyGitCommand = copyGitCommand
	chrome.storage.local.set({ options })
})

commitMessage.addEventListener("click", async (evt) => {
	executor("commit")
});

branchName.addEventListener("click", async (evt) => {
	executor("branch")
});

async function executor(command) {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	let result = await sendMessage(tab.id, command)
	if (result != null && result != undefined) {
		await navigator.clipboard.writeText(result)
		showSuccess()
	}
}