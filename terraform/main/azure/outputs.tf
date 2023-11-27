locals {
  k3s_outputs = { for i, cluster in local.k3s_clusters : cluster.name => {
    local_name           = cluster.local_name,
    local_http_port      = module.k3s_cluster[i].local_http_port
    local_https_port     = module.k3s_cluster[i].local_https_port
    private_name         = module.k3s_cluster[i].first_server_private_name
    public_name          = module.k3s_cluster[i].first_server_public_name
    kubeconfig           = module.k3s_cluster[i].kubeconfig
    context              = module.k3s_cluster[i].context
    node_access_commands = module.k3s_cluster[i].node_access_commands
    ingress_class_name   = module.k3s_cluster[i].ingress_class_name
    }
  }
  rke2_outputs = { for i, cluster in local.rke2_clusters : cluster.name => {
    local_name           = cluster.local_name,
    local_http_port      = module.rke2_cluster[i].local_http_port
    local_https_port     = module.rke2_cluster[i].local_https_port
    private_name         = module.rke2_cluster[i].first_server_private_name
    public_name          = module.rke2_cluster[i].first_server_public_name
    kubeconfig           = module.rke2_cluster[i].kubeconfig
    context              = module.rke2_cluster[i].context
    node_access_commands = module.rke2_cluster[i].node_access_commands
    ingress_class_name   = module.rke2_cluster[i].ingress_class_name
    }
  }
  aks_outputs = { for i, cluster in local.aks_clusters : cluster.name => {
    local_name           = cluster.local_name,
    local_http_port      = module.aks_cluster[i].local_http_port
    local_https_port     = module.aks_cluster[i].local_https_port
    private_name         = module.aks_cluster[i].first_server_private_name
    public_name          = module.aks_cluster[i].first_server_public_name
    kubeconfig           = module.aks_cluster[i].kubeconfig
    context              = module.aks_cluster[i].context
    node_access_commands = module.aks_cluster[i].node_access_commands
    ingress_class_name   = module.aks_cluster[i].ingress_class_name
    }
  }
}

output "clusters" {
  value = merge(local.k3s_outputs, local.rke2_outputs, local.aks_outputs)
}
