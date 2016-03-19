import MidiView from "./MidiView.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";

class SystemSettingsView extends Component {
	render () {	    
	    return (
	    	<section className="system-settings-view">
	    		<MidiView />
	    		<KeyboardInputView />
	    	</section>
	    );
	}
};

module.exports = SystemSettingsView;