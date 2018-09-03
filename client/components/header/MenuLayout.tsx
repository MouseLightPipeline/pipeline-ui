import * as React from "react";
import {Image, Menu, Label, Icon} from "semantic-ui-react";
import {HeaderSummary} from "../dashboard/HeaderSummary";
import {IProject} from "../../models/project";
import {IWorker} from "../../models/worker";

const logoImage = require("../../assets/mouselight-pipeline.svg");
const logoImageSmall = require("../../assets/mouselight-pipeline-sm.svg");

interface IMenuLayoutProps {
    projects: IProject[];
    workers: IWorker[];
    isSidebarExpanded: boolean;
    isActivePipeline: boolean;

    onToggleSidebar(): void;
}

interface IMenuLayoutState {
}

export class MenuLayout extends React.Component<IMenuLayoutProps, IMenuLayoutState> {
    private onToggleSidebar(evt: any) {
        evt.stopPropagation();
        evt.preventDefault();

        this.props.onToggleSidebar();
    }

    public render() {
        const logo = this.props.isSidebarExpanded ? logoImage : logoImageSmall;

        const width = this.props.isSidebarExpanded ? 200 : 80;

        return (
            <Menu inverted fluid className="main-menu" fixed="top">
                <Menu.Item onClick={(evt) => this.onToggleSidebar(evt)}
                           style={{
                               padding: "2px",
                               width: width + "px",
                               backgroundColor: "rgb(41, 41, 41)",
                               transition: "all 0.3s ease"
                           }}>
                    <Image size="small" src={logo} style={{height: "100%", width: width + "px"}}/>
                </Menu.Item>
                <Menu.Item>
                    <Label>
                        <Icon name={this.props.isActivePipeline ? "check circle outline" : "exclamation"} color={this.props.isActivePipeline ? "green" : "red"}/>
                        {this.props.isActivePipeline ? "Active Pipeline" : "Inactive Pipeline"}
                    </Label>
                </Menu.Item>
                <Menu.Menu position="right">
                    <HeaderSummary projects={this.props.projects} workers={this.props.workers} isNavTile={true}/>
                </Menu.Menu>
            </Menu>
        );
    }
}
