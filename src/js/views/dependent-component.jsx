import {Component} from "react";
import {PropTypes} from "prop-types";


class DependentComponent extends Component {

    static propTypes = {
        "dependencies": PropTypes.object.isRequired
    }

    shouldComponentUpdate (nextProps) {
        for (let key in this.props.dependencies) {
            if (nextProps.dependencies[key] !== this.props.dependencies[key]) {
                return true;
            }
        }
        return false;
    }
}


export default DependentComponent;
