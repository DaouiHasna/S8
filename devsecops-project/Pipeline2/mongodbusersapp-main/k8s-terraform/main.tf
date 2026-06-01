terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

provider "kubectl" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

# Create Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.app_namespace
  }
}

# Create registry secret for pulling images
resource "kubernetes_secret" "registry" {
  metadata {
    name      = "gitlab-registry-secret"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  type = "kubernetes.io/dockercfg"

  data = {
    ".dockercfg" = jsonencode({
      "${var.registry_url}" = {
        "auth" = base64encode("${var.registry_username}:${var.registry_password}")
      }
    })
  }
}

# Create MongoDB secret
resource "kubernetes_secret" "mongo" {
  metadata {
    name      = "mongo-secret"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  data = {
    "uri" = var.mongo_uri
  }
}

# Apply Kubernetes manifests
resource "kubectl_manifest" "deployment" {
  yaml_body = file("${path.module}/deploy.yaml")

  depends_on = [kubernetes_namespace.app, kubernetes_secret.registry]
}

# Outputs
output "service_endpoint" {
  description = "Service endpoint for accessing the app"
  value       = "Check with: kubectl get svc -n ${kubernetes_namespace.app.metadata[0].name}"
}