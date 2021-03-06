import * as React from "react";

import {PipelineStagesPanel} from "./PipelineStagesPanel";
import {IPipelineStage} from "../../models/pipelineStage";
import {PipelineStageDetails} from "./details/PipelineStageDetails";
import {PreferencesManager} from "../../util/preferencesManager";
import {IProject} from "../../models/project";
import {ITaskDefinition} from "../../models/taskDefinition";
import {IWorker} from "../../models/worker";

interface IPipelineStagesProps {
    projects: IProject[];
    pipelineStages: IPipelineStage[];
    taskDefinitions: ITaskDefinition[];
    workerMap: Map<string, IWorker>;
}

interface IPipelineStagesState {
    pipelinesForProjectId?: string;
    selectedStage?: IPipelineStage;
}

export class PipelineStages extends React.Component<IPipelineStagesProps, IPipelineStagesState> {
    constructor(props) {
        super(props);

        this.state = {pipelinesForProjectId: "", selectedStage: null};
    }

    private onPipelinesForProjectIdChanged(id: string) {
        this.setState({pipelinesForProjectId: id});
    };

    private onSelectedPipelineStageChanged(stage: IPipelineStage) {
        if (stage === undefined) {
            stage = null;
        }

        this.setState({selectedStage: stage});

        if (stage !== null) {
            PreferencesManager.Instance.PreferredStageId = stage.id;
        }
    };

    public render() {
        return (
            <div>
                <PipelineStagesPanel projects={this.props.projects}
                                     pipelineStages={this.props.pipelineStages}
                                     taskDefinitions={this.props.taskDefinitions}
                                     pipelinesForProjectId={this.state.pipelinesForProjectId}
                                     onPipelinesForProjectIdChanged={(id: string) => this.onPipelinesForProjectIdChanged(id)}
                                     onSelectedPipelineStageChanged={(s: IPipelineStage) => this.onSelectedPipelineStageChanged(s)}/>
                <PipelineStageDetails selectedPipelineStage={this.state.selectedStage} workerMap={this.props.workerMap}/>
            </div>
        );
    }
}
