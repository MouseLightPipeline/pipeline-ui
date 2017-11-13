import * as React from "react";
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {PipelineStageTable} from "./PipelineStageTable";
import { ProjectMenu} from "../helpers/ProjectMenu";
import {IPipelineStage} from "../../models/pipelineStage";
import {IProject} from "../../models/project";
import {StagesHelpPanel} from "./PipelineStagesHelp";
import {toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {EditPipelineStageDialog} from "./EditPipelineStageDialog";
import {CreateStageMutation} from "../../graphql/pipelineStage";
import {TaskQuery} from "../../graphql/taskDefinition";
import {DialogMode} from "../helpers/DialogUtils";
import {themeHighlight} from "../../util/styleDefinitions";
import {PreferencesManager} from "../../util/preferencesManager";

interface IPipelineStagesPanelProps {
    projects: IProject[];
    pipelineStages: IPipelineStage[];
    pipelinesForProjectId: string;
    data?: any;

    onPipelinesForProjectIdChanged(id: string);
    onSelectedPipelineStageChanged(stage: IPipelineStage);

    createPipelineStage?(stage: IPipelineStage): any;
}

interface IPipelineStagesPanelState {
    projectId: string;
    isAddDialogShown?: boolean;
    isFiltered?: boolean;
}

export class __PipelineStagesPanel extends React.Component<IPipelineStagesPanelProps, IPipelineStagesPanelState> {
    constructor(props) {
        super(props);

        this.state = {
            projectId: PreferencesManager.Instance.PreferredProjectId,
            isAddDialogShown: false
        };
    }

    private onToggleIsFiltered() {
        PreferencesManager.Instance.IsStageTableFiltered = !this.state.isFiltered;

        this.setState({isFiltered: !this.state.isFiltered})
    }

    private onClickAddStage(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private onProjectSelectionChange(eventKey) {
        PreferencesManager.Instance.PreferredProjectId = eventKey;

        this.setState({projectId: eventKey}, null);
    }

    private async onAcceptCreateStage(stage: IPipelineStage) {
        this.setState({isAddDialogShown: false});

        try {
            const result = await this.props.createPipelineStage(stage);

            if (!result.data.createPipelineStage.pipelineStage) {
                toast.error(toastCreateError(result.data.createStage.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    private renderMainMenu() {
        const icon = this.state.isFiltered ? "remove" : "filter";
        const content = this.state.isFiltered ? "Remove Filters" : "Apply Filters";

        return (
            <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none"}}>
                <Menu.Header>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        paddingTop: "4px"
                    }}>
                        <Header style={{color: themeHighlight}}>
                            Pipeline Stages
                        </Header>
                    </div>
                </Menu.Header>
                <MenuItem style={{padding: 0}}/>
                <ProjectMenu keyPrefix="createStageSelectProjectTopLevel" projects={this.props.projects}
                             selectedProjectId={this.state.projectId}
                             onProjectSelectionChange={(eventKey) => this.onProjectSelectionChange(eventKey)}
                             includeAllProjects={true}>
                </ProjectMenu>
                <Menu.Menu position="right">
                    <EditPipelineStageDialog element={<MenuItem size="small" content="Add Stage" icon="plus"
                                                                onClick={(evt: any) => this.onClickAddStage(evt)}/>}
                                             show={this.state.isAddDialogShown}
                                             mode={DialogMode.Create}
                                             projects={this.props.projects}
                                             tasks={this.props.data.taskDefinitions}
                                             onCancel={() => this.setState({isAddDialogShown: false})}
                                             onAccept={(s: IPipelineStage) => this.onAcceptCreateStage(s)}/>

                    <MenuItem size="mini" content={content} icon={icon}
                              onClick={() => this.onToggleIsFiltered()}/>

                    <Modal closeIcon={true} trigger={<MenuItem size="small" content="Help" icon="question"/>}>
                        <Modal.Header>Pipeline Projects</Modal.Header>
                        <Modal.Content image>
                            <Modal.Description>
                                <StagesHelpPanel/>
                            </Modal.Description>
                        </Modal.Content>
                    </Modal>
                </Menu.Menu>
            </Menu>
        );
    }

    public render() {
        return (
            <Container fluid style={{display: "flex", flexDirection: "column"}}>
                {this.renderMainMenu()}
                <PipelineStageTable style={{padding: "20px"}}
                                    isFiltered={this.state.isFiltered}
                                    selectedProjectId={this.state.projectId}
                                    pipelineStages={this.props.pipelineStages}
                                    tasks={this.props.data.taskDefinitions}
                                    projects={this.props.projects}
                                    onSelectedPipelineStageChanged={this.props.onSelectedPipelineStageChanged}/>
            </Container>
        );
    }
}

const _PipelineStagesPanel = graphql<any, any>(TaskQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(__PipelineStagesPanel);

export const PipelineStagesPanel = graphql<any, any>(CreateStageMutation, {
    props: ({mutate}) => ({
        createPipelineStage: (pipelineStage: IPipelineStage) => mutate({
            variables: {pipelineStage}
        })
    })
})(_PipelineStagesPanel);