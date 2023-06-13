# Mini PWA
Very simple code to demonstrate Progressive Web Apps.

## Usage
This demo app runs on localhost.

```sh
npm install http-server -g
http-server -c-1 # with cache disabled

# 用另一个终端
ngrok http 8080
```
Then open http://localhost:8080 with Chrome.

Change `cacheStorageKey` in `sw.js` to update app version.

Use ngrok to generate https link for android chrome

## Trouble shooting
- Why `-c-1` to disable cache?

`sw.js` can be cached by HTTP Caches, then in debugging we could get unexpected behaviors. Disable the cache to simplify the problem.

## License
MIT
