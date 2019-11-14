# Origin UI

## Docker

If you would like to run Origin UI as a separate Docker image please use following commands:

```
yarn build
docker build . -t origin-ui
docker run -p 80:80 --env-file ../../.env -t origin-ui
```