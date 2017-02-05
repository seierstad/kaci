import {Component, PropTypes} from "react";


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
