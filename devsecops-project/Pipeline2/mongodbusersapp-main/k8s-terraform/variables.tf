variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = ""
}

variable "app_namespace" {
  description = "Kubernetes namespace for the app"
  type        = string
  default     = "default"
}

variable "registry_url" {
  description = "Docker registry URL"
  type        = string
  default     = "registry.example.com"
}

variable "registry_username" {
  description = "Docker registry username"
  type        = string
  sensitive   = true
}

variable "registry_password" {
  description = "Docker registry password"
  type        = string
  sensitive   = true
}

variable "mongo_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
  default     = "mongodb://localhost:27017/mongo-crud-app"
}

variable "gitlab_user" {}
variable "gitlab_token" {}

