import gql from "graphql-tag";

export const WorkerFragment = gql`fragment WorkerFields on PipelineWorker {
    id
    name
    worker_id
    local_work_capacity
    cluster_work_capacity
    last_seen
    local_task_load
    cluster_task_load
    status
    is_in_scheduler_pool
}`;

export const UpdateWorkerMutation = gql`mutation UpdateWorker($worker: PipelineWorkerInput) {
    updateWorker(worker: $worker) {
        source {
          ...WorkerFields
        }   
        error
    }
}
${WorkerFragment}
`;
