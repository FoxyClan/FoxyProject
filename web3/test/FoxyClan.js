const FoxyClan = artifacts.require("./FoxyClan");

contract("FoxyClan", accounts => {
    it("setSaleState = true", async function() {
        const Contract = await FoxyClan.deployed();
        const result = await Contract.setSaleState(true, {from: accounts[0]});
        const stateSale = await Contract.saleIsActive();
        assert.equal(stateSale, true, "Must be true");
    })

    it("mint 5 to account[1]", async function() {
        const Contract = await FoxyClan.deployed();
        const result = await Contract.mint(5, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
        const balance = await Contract.balanceOf(accounts[1]);
        const contractBalance = await web3.eth.getBalance(Contract.address);
        const balanceInEther = web3.utils.fromWei(contractBalance, 'ether');
        assert.equal(balanceInEther, '1', "Contract balance should be 1 ether");
        assert.equal(balance, "5", "Must be 5");
    })

    it("transfer TokenId=3 from [1] to [2]", async function() {
        const Contract = await FoxyClan.deployed();
        const result = await Contract.safeTransferFrom(accounts[1], accounts[2], 3, {from: accounts[1]});
        /*
        const event = await Contract.getPastEvents('Transfer', {
            fromBlock: 'latest',
            toBlock: 'latest'
          });
        console.log(event[0].returnValues);
        */
        const balance1 = await Contract.balanceOf(accounts[1]);
        const balance2 = await Contract.balanceOf(accounts[2]);
        assert.equal(balance1, "4", "Must be 4");
        assert.equal(balance2, "1", "Must be 1");
    })

    it("withdraw", async function() {
        const Contract = await FoxyClan.deployed();
        const accountBalanceBeforeWithdraw = await web3.eth.getBalance(Contract.address);
        const balanceInEtherBeforeWithdraw = await web3.utils.fromWei(accountBalanceBeforeWithdraw, 'ether');
        assert.equal(balanceInEtherBeforeWithdraw, "1", "Balance should be 1 before withdraw");
        const withdraw = await Contract.withdraw({from: accounts[0]});
        const accountBalanceAfterWithdraw = await web3.eth.getBalance(Contract.address);
        const balanceInEtherAfterWithdraw = await web3.utils.fromWei(accountBalanceAfterWithdraw, 'ether');
        assert.equal(balanceInEtherAfterWithdraw, "0", "Balance should be 1 before withdraw");
    })

    it("setAllowList", async function() {
        const Contract = await FoxyClan.deployed();
        const list = await Contract.setAllowList([accounts[3], accounts[4]], 6, {from: accounts[0]});
        const numAvailableToMint3 = await Contract.numAvailableToMint(accounts[3], {from: accounts[0]});
        const numAvailableToMint4 = await Contract.numAvailableToMint(accounts[4], {from: accounts[0]});
        assert.equal(numAvailableToMint3, "6", "numAvailableToMint must be 6");
        assert.equal(numAvailableToMint4, "6", "numAvailableToMint must be 6");
    })

    it("mintAllowList", async function() {
        const Contract = await FoxyClan.deployed();
        const setIsAllowListActive = await Contract.setIsAllowListActive(true, {from: accounts[0]});
        const mintAllowList3 = await Contract.mintAllowList(3, {from: accounts[3], value: web3.utils.toWei('0.5', 'ether')});
        const mintAllowList4 = await Contract.mintAllowList(6, {from: accounts[4], value: web3.utils.toWei('1', 'ether')});
        const numAvailableToMint3 = await Contract.numAvailableToMint(accounts[3], {from: accounts[0]});
        const numAvailableToMint4 = await Contract.numAvailableToMint(accounts[4], {from: accounts[0]});
        assert.equal(numAvailableToMint3, "3", "numAvailableToMint must be 3");
        assert.equal(numAvailableToMint4, "0", "numAvailableToMint must be 0");
        const contractBalance = await web3.eth.getBalance(Contract.address);
        const balanceInEther = web3.utils.fromWei(contractBalance, 'ether');
        assert.equal(balanceInEther, '1.5', "Contract balance should be 1.5 ether");
    })

    it("tokensOfOwner", async function() {
        const Contract = await FoxyClan.deployed();
        const tokenIds = [];
        const balanceOf4 = await Contract.balanceOf(accounts[4]);
        assert.equal(balanceOf4, "6", "[4] must have 6 token");
        const totalSupply = await Contract.totalSupply();
        for(let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const ownerOfToken = await Contract.ownerOf(tokenId);
            if (ownerOfToken === accounts[4]) {
                tokenIds.push(tokenId);
            }
        }
        console.log(tokenIds);
    })

    

    

    //OWNER

    it("owner is [0]", async function() {
        const Contract = await FoxyClan.deployed();
        const owner = await Contract.owner();
        assert.equal(owner, accounts[0], "Owner must be 0");
    })

    it("owner [0]->[1]->[0]", async function() {
        const Contract = await FoxyClan.deployed();
        const transferOwnership = await Contract.transferOwnership(accounts[1], {from: accounts[0]});
        const owner = await Contract.owner();
        assert.equal(owner, accounts[1], "Owner must be 1");
        transferOwnership2 = await Contract.transferOwnership(accounts[0], {from: accounts[1]});
        owner2 = await Contract.owner();
        assert.equal(owner2, accounts[0], "Owner must be 0");
    })
})