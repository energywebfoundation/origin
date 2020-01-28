<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Exchange</h2>
  <br>
</h1>

**Exchange** package provides the order book based exchange functionality for the certificates issued by `issuer` package. The major difference between classic (asset, time, price) order book system is the **product** based matching engine, providing the ability to create custom matching rules.

## Main features
- Order book matching engine for time, price and product matching
- ERC 1155 / ERC 1888 compatible
- Supply / Demand modules 

## Trading product concept

### Definition

`Product` defines the characteristics of the given producing device as well as buyers preferences . Currently it's represented as:

```
export class Product {
    public deviceType?: string[];

    public location?: string[];

    public deviceVintage?: number;
}
```

Where

- `deviceType` - describes the the type of the device for e.g using I-REC types
- `location` - describes the location of the the device for e.g can be multi-level like Country->Region->Province
- `deviceVintage` - describes the vintage of the device for e.g the start year of the device operation

For a producing device all fields are mandatory.

## Development

Default TypeOrm configuration requires running PostgreSQL database. The detailed config is:

```
TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'origin-exchange',
            entities: [Demand, Order, Trade],
            synchronize: true,
            logging: ['query']
        }),
```

```
yarn
yarn start
```

### PostgreSQL installation using Docker

```
docker pull postgres
docker run --name origin-postgres -d -p 5432:5432 postgres
```

### Swagger

Swagger endpoint can be found at

`http://localhost:3000/api`