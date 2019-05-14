import {number, shape} from "prop-types";
import {rangeShape} from "../static-source/propdefs";
import {syncPatchShape, syncConfigShape} from "./sync/propdefs";

export const speedPatchProperties = {
    "frequency": number.isRequired,
    "sync": syncPatchShape
};

export const speedPatchShape = shape(speedPatchProperties);

export const speedConfigProperties = {
    "frequency": rangeShape.isRequired,
    "sync": syncConfigShape
};
