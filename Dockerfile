FROM alpine:latest AS builder

RUN apk add nodejs-current yarn

WORKDIR /build
COPY src/ package.json tsconfig.json /build/
RUN yarn && yarn tsc

FROM alpine:latest

RUN apk add nodejs-current

WORKDIR /app
COPY --from=builder /build/out /app
COPY --from=builder /build/node_modules /app/node_modules

CMD ["node", "/app/index.js"]
