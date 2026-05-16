# Run from the bot-street-terminal folder

$PROJECT = "bot-street"
$REGION  = "us-central1"
$SERVICE = "bot-street-terminal"
$IMAGE   = "$REGION-docker.pkg.dev/$PROJECT/bot-street/frontend:v3"

# Build and push
gcloud auth configure-docker "$REGION-docker.pkg.dev"
docker build -t $IMAGE .
docker push $IMAGE

# Deploy to Cloud Run
gcloud run deploy $SERVICE `
  --image $IMAGE `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --port 8080 `
  --project $PROJECT

Write-Host ""
Write-Host "Frontend deployed!" -ForegroundColor Green