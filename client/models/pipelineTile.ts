import {TilePipelineStatus} from "./tilePipelineStatus";

export interface IPipelineTile {
    stage_id?: string
    relative_path?: string;
    tile_name?: string;
    x?: number;
    y?: number;
    z?: number;
    lat_x?: number;
    lat_y?: number;
    lat_z?: number;
    stage_status?: TilePipelineStatus;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
