import gql from "graphql-tag";

export const TaskExecutionFieldsFragment = gql`fragment TaskExecutionFields on TaskExecution {
    id
    worker_id
    queue_type
    resolved_output_path
    resolved_script
    resolved_script_args
    resolved_cluster_args
    resolved_log_path
    execution_status_code
    completion_status_code
    cpu_time_seconds
    max_cpu_percent
    max_memory_mb
    exit_code
    submitted_at
    started_at
    completed_at
    updated_at
}`;

export const StopTaskExecutionMutation = gql`mutation StopTaskExecution($pipelineStageId: String!, $taskExecutionId: String!) {
  stopTaskExecution(pipelineStageId: $pipelineStageId, taskExecutionId: $taskExecutionId) {
    ...TaskExecutionFields
  }
}
${TaskExecutionFieldsFragment}`;


export const RemoveTaskExecutionMutation = gql`mutation RemoveTaskExecution($pipelineStageId: String!, $taskExecutionId: String!) {
  removeTaskExecution(pipelineStageId: $pipelineStageId, taskExecutionId: $taskExecutionId)
}`;
