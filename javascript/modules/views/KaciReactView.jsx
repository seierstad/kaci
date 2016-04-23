import React, {Component} from "react";
import SystemSettingsView from "./SystemSettingsView.jsx";
import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import Envelopes from "./EnvelopeView.jsx";
import LFOs from "./LFOView.jsx";
import ModulationMatrix from "./ModulationMatrixView.jsx";
//import Oscillator from "./OscillatorView.jsx";

class KaciReactView extends Component {
    render () {
        return (
        	<div>
        	    <SystemSettingsView />

        	    <NoiseView />
        	    <SubView />
        	    <Envelopes />
                <LFOs />
                <ModulationMatrix />
        	</div>
        );
    }
}
export default KaciReactView;
