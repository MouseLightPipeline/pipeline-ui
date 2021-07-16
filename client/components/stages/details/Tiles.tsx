import * as React from "react";
import {Container, Menu} from "semantic-ui-react";
import {Mutation} from "react-apollo";

import {IPipelineStage} from "../../../models/pipelineStage";
import {TilesTable} from "./TilesTable";
import {
    TILE_PIPELINE_STATUS_TYPES, TilePipelineStatus,
    TilePipelineStatusType
} from "../../../models/tilePipelineStatus";
import {TilePipelineStatusSelect} from "../../helpers/TilePipelineStatusSelect";
import {PreferencesManager} from "../../../util/preferencesManager";
import {ConvertTileStatusMutation, SetTileStatusMutation, TilesForStageQuery} from "../../../graphql/pipelineTile";
import {IWorker} from "../../../models/worker";
import {TaskExecution} from "../../../models/taskExecution";
import {useQuery} from "react-apollo-hooks";

interface ITilesProps {
    pipelineStage: IPipelineStage;
    workerMap: Map<string, IWorker>;
}

interface ITilesState {
    offset?: number;
    limit?: number;
    requestedStatus?: TilePipelineStatusType;
}

export class Tiles extends React.Component<ITilesProps, ITilesState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            offset: 0,
            limit: PreferencesManager.Instance.StageDetailsPageSize,
            requestedStatus: TilePipelineStatusType.fromStatus(PreferencesManager.Instance.TilePipelineStatus)
        }
    }

    private onTilePipelineStatusTypeChanged(t: TilePipelineStatusType) {
        PreferencesManager.Instance.TilePipelineStatus = t.option;

        this.setState({requestedStatus: t});
    }

    private updateCursor(page: number, pageSize: number) {
        const offset = page * pageSize;

        if (offset !== this.state.offset) {
            this.setState({
                offset,
            });
        }
        if (pageSize !== this.state.limit && !isNaN(pageSize)) {
            PreferencesManager.Instance.StageDetailsPageSize = pageSize;
            this.setState({
                limit: pageSize
            });
        }
    }

    public render() {
        return (
            <TilesTablePanel pipelineStage={this.props.pipelineStage}
                             requestedStatus={this.state.requestedStatus}
                             offset={this.state.offset}
                             limit={this.state.limit}
                             workerMap={this.props.workerMap}
                             onCursorChanged={(page: number, pageSize: number) => this.updateCursor(page, pageSize)}
                             onRequestedStatusChanged={(t: TilePipelineStatusType) => this.onTilePipelineStatusTypeChanged(t)}/>
        );
    }
}

interface ITilesTablePanelProps {
    data?: any;
    offset: number;
    limit: number;
    pipelineStage: IPipelineStage;
    requestedStatus?: TilePipelineStatusType;
    workerMap: Map<string, IWorker>;

    onCursorChanged(page: number, pageSize: number): void;

    onRequestedStatusChanged(t: TilePipelineStatusType): void;

    setTileStatus?(pipelineStageId: string, tileIds: string[], status: TilePipelineStatus): any;

    convertTileStatus?(pipelineStageId: string, currentStatus: TilePipelineStatus, desiredStatus: TilePipelineStatus): any;
}

const TilesTablePanel = (props: ITilesTablePanelProps) => {
    const {loading, error, data} = useQuery(TilesForStageQuery,
        {
            pollInterval: 10000,
            ssr: false,
            fetchPolicy: "cache-and-network",
            variables: {
                pipelineStageId: props.pipelineStage.id,
                status: props.requestedStatus.option,
                offset: props.offset,
                limit: props.limit
            }
        });

    let tilesForStage = null;
    let pageCount = -1;

    if (!loading && !error) {
        tilesForStage = data.tilesForStage.items.map(item => Object.assign({}, item, {task_executions: item.task_executions.map(t => new TaskExecution(t))}));
        if (data.tilesForStage.totalCount > 0 && data.tilesForStage.limit > 0) {
            pageCount = Math.ceil(data.tilesForStage.totalCount / data.tilesForStage.limit);
        }
    }

    return (
        <Container fluid style={{padding: "20px"}}>
            <Menu size="mini" style={{borderBottomWidth: "1px", borderRadius: 0, marginBottom: 0, boxShadow: "none"}}>
                <TilePipelineStatusSelect
                    statusTypes={TILE_PIPELINE_STATUS_TYPES}
                    selectedStatus={props.requestedStatus}
                    onSelectStatus={(t) => props.onRequestedStatusChanged(t)}/>
                <Menu.Menu position="right">
                    <Mutation mutation={SetTileStatusMutation}>
                        {(setTileStatus) => (
                            <Menu.Item size="mini" content="Resubmit Page" icon="repeat"
                                       disabled={!props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                       onClick={() => setTileStatus({
                                           variables: {
                                               pipelineStageId: props.pipelineStage.id,
                                               tileIds: tilesForStage.items.map(t => t.relative_path),
                                               status: TilePipelineStatus.Incomplete
                                           }
                                       })}/>
                        )
                        }
                    </Mutation>
                    <Mutation mutation={ConvertTileStatusMutation}>
                        {(convertTileStatus) => (
                            <Menu.Item size="mini" content="Resubmit All" icon="repeat"
                                       disabled={!props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                       onClick={() => convertTileStatus({
                                           variables: {
                                               pipelineStageId: props.pipelineStage.id,
                                               currentStatus: props.requestedStatus.option,
                                               desiredStatus: TilePipelineStatus.Incomplete
                                           }
                                       })}/>
                        )
                        }
                    </Mutation>
                </Menu.Menu>
            </Menu>
            <TilesTable pipelineStage={props.pipelineStage}
                        tiles={tilesForStage}
                        canSubmit={props.requestedStatus.canSubmit}
                        loading={loading}
                        pageCount={pageCount}
                        workerMap={props.workerMap}
                        onCursorChanged={props.onCursorChanged}
            />

        </Container>
    );
}
