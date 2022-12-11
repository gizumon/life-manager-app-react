# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Copy chakra config and prisma schema
COPY ./configs  ./configs
# COPY ./prisma  ./prisma # TODO: Removed when prisma is not needed

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

### Set ENV here
ENV NODE_ENV production

ARG APP_ENV
ENV APP_ENV ${APP_ENV:-prod}

ARG LIFF_ID
ENV LIFF_ID ${LIFF_ID}

ARG FIREBASE_API_KEY
ENV FIREBASE_API_KEY ${FIREBASE_API_KEY}

ARG CHANNEL_ACCESS_TOKEN
ENV CHANNEL_ACCESS_TOKEN ${CHANNEL_ACCESS_TOKEN}

ARG CHANNEL_SECRET
ENV CHANNEL_SECRET ${CHANNEL_SECRET}

ARG GA_ID
ENV GA_ID ${GA_ID}

ARG LINE_AUTH_ENDPOINT
ENV LINE_AUTH_ENDPOINT ${LINE_AUTH_ENDPOINT}

ARG LINE_AUTH_CLIENT_ID
ENV LINE_AUTH_CLIENT_ID ${LINE_AUTH_CLIENT_ID}

ARG LINE_AUTH_CLIENT_SECRET
ENV LINE_AUTH_CLIENT_SECRET ${LINE_AUTH_CLIENT_SECRET}

ARG FIREBASE_ADMIN_PROJECT_ID
ENV FIREBASE_ADMIN_PROJECT_ID ${FIREBASE_ADMIN_PROJECT_ID}

ARG FIREBASE_ADMIN_PRIVATE_KEY_ID
ENV FIREBASE_ADMIN_PRIVATE_KEY_ID ${FIREBASE_ADMIN_PRIVATE_KEY_ID}

ARG FIREBASE_ADMIN_PRIVATE_KEY
ENV FIREBASE_ADMIN_PRIVATE_KEY ${FIREBASE_ADMIN_PRIVATE_KEY}

ARG FIREBASE_ADMIN_CLIENT_EMAIL
ENV FIREBASE_ADMIN_CLIENT_EMAIL ${FIREBASE_ADMIN_CLIENT_EMAIL}

ARG FIREBASE_ADMIN_CLIENT_ID
ENV FIREBASE_ADMIN_CLIENT_ID ${FIREBASE_ADMIN_CLIENT_ID}

ARG FIREBASE_ADMIN_CLIENT_x509_CERT_URL
ENV FIREBASE_ADMIN_CLIENT_x509_CERT_URL ${FIREBASE_ADMIN_CLIENT_x509_CERT_URL}

ARG FIREBASE_DB_URL
ENV FIREBASE_DB_URL ${FIREBASE_DB_URL}

###

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

### Set ENV that is needed for the app while running
ENV NODE_ENV production

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET ${NEXTAUTH_SECRET}

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL ${NEXTAUTH_URL}

RUN echo "NEXTAUTH_URL: ${NEXTAUTH_URL}"

# ENV APP_ENV ${APP_ENV:-prod}
# ENV NEXT_PUBLIC_GA_ID ${NEXT_PUBLIC_GA_ID}
###
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]