import React, {Component} from "react";
import SystemSettingsView from "./SystemSettingsView.jsx";
import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import EnvelopeView from "./EnvelopeView.jsx";

class KaciReactView extends Component {
    render () {
        return (
        	<div>
        	    <SystemSettingsView />
        	    <NoiseView />
        	    <SubView />
        	    <EnvelopeView />
        	</div>
        );
    }
}
export default KaciReactView;
