# Deployment Procedures

**Skill ID**: deployment-procedures
**Version**: 1.0.0

## Pre-Deployment Checklist

1. Run all tests: `pnpm test`
2. Run linting: `npm run lint`
3. Run type checking: `pnpm type-check`
4. Run build: `npm run build`
5. Check security: `npm audit`

All must pass before deployment.

## Docker

```bash
docker build -t disaster-recovery-nrpg:latest .
docker push <registry>/disaster-recovery-nrpg:latest
```

## Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl logs <pod-name>
```

## Environment Variables

Set in deployment platform:
- DATABASE_URL
- REDIS_URL
- NEXTAUTH_SECRET
- STRIPE_SECRET_KEY
- OPENAI_API_KEY

Load when deploying to staging or production.
