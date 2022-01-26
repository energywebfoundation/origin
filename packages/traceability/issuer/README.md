<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Issuer

## Description

The Issuer package contains smart contracts and interfaces that handle the management of Energy Attribute Certificates on the blockchain.

It is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) Traceability SDK.

## Documentation

-   [Issuer](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/packages/issuer/)
-   [Traceability SDK](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/)

## Contributing Guidelines

See [contributing.md](../../../contributing.md)

# Energy Web Decentralized Operating System

EW-Origin is a component of the Energy Web Decentralized Operating System (EW-DOS).

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

-   To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/)

For a deep-dive into the motivation and methodology behind our technical solutions, read our White Papers:

-   [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
-   [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

-   [Twitter](https://twitter.com/energywebx)
-   [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
-   [Telegram](https://t.me/energyweb)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Notes:

`prevCommitment` is required to prevent state corruption, transition to new commitment based on other state that's currently on-chain will result in error.

Implementation:

-   Certificate owner A has 1000kWh of energy on certificate id = 1 (C1)
-   A requesting private transfer of 500kWh from C1 to B
    -   A calls API with (id, value, newOwner) in our case (1, 500000, B)
    -   if API approves the transfer (enough balance, maybe other API checks)
        -   API returns (updatedBalanceOfA, salt) in our case (500000, 'randomsalt')
        -   A creates onChain request where hash = hash(address, updatedBalanceOfA, salt) in our case hash(A, 5000000, salt)
        -   Issuer - approves by sending new commitment that is verified against the request.hash
