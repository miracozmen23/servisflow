# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

FROM base AS dependencies
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts

FROM dependencies AS build
COPY apps/api apps/api
RUN DATABASE_URL=postgresql://docker-build:docker-build@127.0.0.1:5432/docker-build?schema=public \
    npm run build --workspace=@servisflow/api

FROM build AS migration
ENV NODE_ENV=production
CMD ["npm", "run", "prisma:migrate:deploy", "--workspace=@servisflow/api"]

FROM base AS production-dependencies
ENV NODE_ENV=production
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --omit=optional --ignore-scripts --workspace=@servisflow/api --include-workspace-root

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

COPY --from=production-dependencies --chown=node:node /app ./
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist

USER node
EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then((response)=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "apps/api/dist/main.js"]
