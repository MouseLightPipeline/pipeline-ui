import gql from "graphql-tag";
import {TaskExecutionFieldsFragment} from "./taskExecution";

export const TilesForStageQuery = gql`query($pipelineStageId: String, $status: Int, $offset: Int, $limit: Int) {
    tilesForStage(pipelineStageId: $pipelineStageId, status: $status, offset: $offset, limit: $limit) {
        offset
        limit
        totalCount
        hasNextPage
        items {
            relative_path
            lat_x
            lat_y
            lat_z
            task_executions {
                ...TaskExecutionFields
            }
        }
    }
}
${TaskExecutionFieldsFragment}
`;

export const SetTileStatusMutation = gql`mutation SetTileStatus($pipelineStageId: String, $tileIds: [String], $status: Int) {
  setTileStatus(pipelineStageId: $pipelineStageId, tileIds: $tileIds, status: $status) {
    relative_path
    lat_x
    lat_y
    lat_z
    this_stage_status
  }
}`;

export const ConvertTileStatusMutation = gql`mutation SetTileStatus($pipelineStageId: String, $currentStatus: Int, $desiredStatus: Int) {
  convertTileStatus(pipelineStageId: $pipelineStageId, currentStatus: $currentStatus, desiredStatus: $desiredStatus) {
    relative_path
    lat_x
    lat_y
    lat_z
    this_stage_status
  }
}`;
