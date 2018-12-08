import {number, shape} from "prop-types";
import {syncPatchShape, syncConfigShape} from "../sync/propdefs";
import {rangeShape} from "../static-source/propdefs";


export const periodicModulatorPatchShape = shape({
    "frequency": number.isRequired,
    "sync": syncPatchShape
});

export const periodicPatchProperties = {
    "frequency": number.isRequired,
    "sync": syncPatchShape
};

export const periodicConfigProperties = {
    "frequency": rangeShape.isRequired,
    "sync": syncConfigShape
};

export const periodicModulatorsConfigShape = shape(periodicConfigProperties);

