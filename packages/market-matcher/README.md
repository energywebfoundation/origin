<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Market Matcher</h2>
  <br>
</h1>

**Market matcher** is an off-chain agent that facilitaties the demand and supply matching and execution. It's run typically run by the market responsible party.

## Architecture

Market matcher consist of 4 major components:

- **Triggers** - serves as an input for the matcher
- **EntityStore** - serves as a data layer for the matcher
- **Matchable componenets** - encapsulates the matching rules
- **Strategies** - provides a customized ordering 

## General matching flow
<p align="center">
<img src="https://user-images.githubusercontent.com/5417665/69529055-cc347d80-0f6f-11ea-8582-5ea7d8370114.png" width="300px"></img>
</p>
