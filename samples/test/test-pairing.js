
const fs = require('fs')

const host = "http://localhost:8545"
const assert = require('assert')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(host))

const getNetwork = require('truebit-util').getNetwork

let account, fileSystem, sampleSubmitter

before(async () => {
    let accounts = await web3.eth.getAccounts()
    account = accounts[0]
})

describe('Truebit Bilinear pairing test', async function() {
    this.timeout(600000)

    it('should have a web3', () => {
        assert(web3)
    })

    it('connect to contracts', async () => {
        let networkName = await getNetwork(web3)

        //get scrypt submitter artifact
	    const artifacts = JSON.parse(fs.readFileSync("pairing/public/" + networkName + ".json"))

        // fileSystem = new web3.eth.Contract(artifacts.fileSystem.abi, artifacts.fileSystem.address)
        sampleSubmitter = new web3.eth.Contract(artifacts.sample.abi, artifacts.sample.address)

    })

    let dta = new Buffer("hjkl")

    it('submit test task', async () => {
        await sampleSubmitter.methods.submitData(dta).send({gas: 2000000, from: account})
    })
    it('wait for solution', async () => {
        let solution = "0x0000000000000000000000000000000000000000000000000000000000000000"
        while (solution == "0x0000000000000000000000000000000000000000000000000000000000000000") {
            await sampleSubmitter.methods.getResult(dta).send({from: account})
            solution = await sampleSubmitter.methods.getResult(dta).call()
        }
        assert.equal(solution, "0x0152fae0b81e20f3e003439e9f2dead8e77e28d59f369ff166f351aacf84ff76")
    })

})
