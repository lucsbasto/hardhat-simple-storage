const { ethers, run, network } = require("hardhat")

const main = async () => {
  const factory = await ethers.getContractFactory("SimpleStorage")
  const simpleStorage = await factory.deploy()
  console.log("Deploying contract to:", simpleStorage.address)
  await simpleStorage.deployed()
  console.log(`contract deployed at ${simpleStorage.address}`)
  if (network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    const blocksConformation = 6
    console.log(`Waiting for ${blocksConformation} blocks confirmations`)
    await simpleStorage.deployTransaction.wait(blocksConformation)
    await verify(simpleStorage.address, [])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value: ${currentValue}`)
  const transaction = await simpleStorage.store(10)
  await transaction.wait(1)
  const newValue = await simpleStorage.retrieve()
  console.log(`New value: ${newValue}`)
}

const verify = async (contractAddress, args) => {
  console.log("Veryfing contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    const alreadyVerified = error.message
      .toLowerCase()
      .includes("already verified")
    alreadyVerified
      ? console.log("Contract already verified")
      : console.log(error)
    process.exit(1)
  }
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()
