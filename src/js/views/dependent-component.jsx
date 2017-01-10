import {Component, PropTypes} from "react";


class DependentComponent extends Component {

    shouldComponentUpdate (nextProps) {
        for (let key in this.props.dependencies) {
            if (nextProps.dependencies[key] !== this.props.dependencies[key]) {
                return true;
            }
        }
        return false;
    }
}
DependentComponent.propTypes = {
    "dependencies": PropTypes.object.isRequired
};


export default DependentComponent;
