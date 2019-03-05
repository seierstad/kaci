import {number, shape} from "prop-types";
import {syncPatchShape, syncConfigShape} from "../sync/propdefs";
import {rangeShape} from "../static-source/propdefs";

const speedPatchProperties = {
    "frequency": number.isRequired,
    "sync": syncPatchShape
};

const speedConfigProperties = {
    "frequency": rangeShape.isRequired,
    "sync": syncConfigShape
};

/* patch exports */

export const periodicModulatorPatchProperties = {
    "speed": shape(speedPatchProperties)
};

export const periodicModulatorPatchShape = shape(periodicModulatorPatchProperties);


export const discretePeriodicModulatorPatchProperties = {
    "speed": shape({
        ...periodicModulatorPatchProperties,
        "speedUnit": number.isRequired
    })
};

export const discretePeriodicModulatorPatchShape = shape(discretePeriodicModulatorPatchProperties);


/* config exports */

export const periodicModulatorConfigProperties = {
    "speed": shape(speedConfigProperties)
};

export const periodicModulatorConfigShape = shape(periodicModulatorConfigProperties);


export const discretePeriodicModulatorConfigProperties = {
    "speed": shape({
        ...speedConfigProperties,
        "speedUnit": rangeShape.isRequired
    })
};

export const discretePeriodicModulatorConfigShape = shape(discretePeriodicModulatorConfigProperties);
