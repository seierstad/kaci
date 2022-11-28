import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import * as DEFAULTS from "../defaults.js";

class BlofeldParameters extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    @autobind
    handleDeviceId (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeDeviceID(parseInt(event.target.value), this.props.patch);
    }

    @autobind
    handleSlotChange (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeSlot(parseInt(event.target.value), this.props.patch);
    }

    @autobind
    handleName (event) {
        event.stopPropagation();
        this.props.handlers.waldorf.blofeld.changeName(event.target.value, this.props.patch);
    }

    render () {
        const {
            handlers,
            viewState: {
                name = DEFAULTS.NAME,
                slot = DEFAULTS.SLOT,
                deviceId = DEFAULTS.DEVICE_ID
            }
        } = this.props;

        return (
            <fieldset>
                <legend>Waldorf Blofeld parameters</legend>
                <label>
                    <span className="label-text">Wavetable name</span>
                    <input maxLength="14" onChange={this.handleName} pattern="[\x20-\x7F]*" placeholder={DEFAULTS.NAME} value={name} />
                </label>
                <label>
                    <span className="label-text">Wavetable slot</span>
                    <input max="118" min="80" onChange={this.handleSlotChange} placeholder={DEFAULTS.SLOT} type="number" value={slot} />
                </label>
                <label>
                    <span className="label-text">Device ID</span>
                    <select onChange={this.handleDeviceId} value={deviceId}>
                        <option value={0x7F}>all</option>
                        <option value={0x00}>00</option>
                        <option value={0x01}>01</option>
                        <option value={0x02}>02</option>
                        <option value={0x03}>03</option>
                        <option value={0x04}>04</option>
                        <option value={0x05}>05</option>
                        <option value={0x06}>06</option>
                        <option value={0x07}>07</option>
                        <option value={0x08}>08</option>
                        <option value={0x09}>09</option>
                        <option value={0x0A}>0A</option>
                        <option value={0x0B}>0B</option>
                        <option value={0x0C}>0C</option>
                        <option value={0x0D}>0D</option>
                        <option value={0x0E}>0E</option>
                        <option value={0x0F}>0F</option>

                        <option value={0x10}>10</option>
                        <option value={0x11}>11</option>
                        <option value={0x12}>12</option>
                        <option value={0x13}>13</option>
                        <option value={0x14}>14</option>
                        <option value={0x15}>15</option>
                        <option value={0x16}>16</option>
                        <option value={0x17}>17</option>
                        <option value={0x18}>18</option>
                        <option value={0x19}>19</option>
                        <option value={0x1A}>1A</option>
                        <option value={0x1B}>1B</option>
                        <option value={0x1C}>1C</option>
                        <option value={0x1D}>1D</option>
                        <option value={0x1E}>1E</option>
                        <option value={0x1F}>1F</option>

                        <option value={0x0}>20</option>
                        <option value={0x1}>21</option>
                        <option value={0x2}>22</option>
                        <option value={0x3}>23</option>
                        <option value={0x4}>24</option>
                        <option value={0x5}>25</option>
                        <option value={0x6}>26</option>
                        <option value={0x7}>27</option>
                        <option value={0x8}>28</option>
                        <option value={0x9}>29</option>
                        <option value={0xA}>2A</option>
                        <option value={0xB}>2B</option>
                        <option value={0xC}>2C</option>
                        <option value={0xD}>2D</option>
                        <option value={0xE}>2E</option>
                        <option value={0xF}>2F</option>

                        <option value={0x30}>30</option>
                        <option value={0x31}>31</option>
                        <option value={0x32}>32</option>
                        <option value={0x33}>33</option>
                        <option value={0x34}>34</option>
                        <option value={0x35}>35</option>
                        <option value={0x36}>36</option>
                        <option value={0x37}>37</option>
                        <option value={0x38}>38</option>
                        <option value={0x39}>39</option>
                        <option value={0x3A}>3A</option>
                        <option value={0x3B}>3B</option>
                        <option value={0x3C}>3C</option>
                        <option value={0x3D}>3D</option>
                        <option value={0x3E}>3E</option>
                        <option value={0x3F}>3F</option>

                        <option value={0x40}>40</option>
                        <option value={0x41}>41</option>
                        <option value={0x42}>42</option>
                        <option value={0x43}>43</option>
                        <option value={0x44}>44</option>
                        <option value={0x45}>45</option>
                        <option value={0x46}>46</option>
                        <option value={0x47}>47</option>
                        <option value={0x48}>48</option>
                        <option value={0x49}>49</option>
                        <option value={0x4A}>4A</option>
                        <option value={0x4B}>4B</option>
                        <option value={0x4C}>4C</option>
                        <option value={0x4D}>4D</option>
                        <option value={0x4E}>4E</option>
                        <option value={0x4F}>4F</option>

                        <option value={0x50}>50</option>
                        <option value={0x51}>51</option>
                        <option value={0x52}>52</option>
                        <option value={0x53}>53</option>
                        <option value={0x54}>54</option>
                        <option value={0x55}>55</option>
                        <option value={0x56}>56</option>
                        <option value={0x57}>57</option>
                        <option value={0x58}>58</option>
                        <option value={0x59}>59</option>
                        <option value={0x5A}>5A</option>
                        <option value={0x5B}>5B</option>
                        <option value={0x5C}>5C</option>
                        <option value={0x5D}>5D</option>
                        <option value={0x5E}>5E</option>
                        <option value={0x5F}>5F</option>

                        <option value={0x60}>60</option>
                        <option value={0x61}>61</option>
                        <option value={0x62}>62</option>
                        <option value={0x63}>63</option>
                        <option value={0x64}>64</option>
                        <option value={0x65}>65</option>
                        <option value={0x66}>66</option>
                        <option value={0x67}>67</option>
                        <option value={0x68}>68</option>
                        <option value={0x69}>69</option>
                        <option value={0x6A}>6A</option>
                        <option value={0x6B}>6B</option>
                        <option value={0x6C}>6C</option>
                        <option value={0x6D}>6D</option>
                        <option value={0x6E}>6E</option>
                        <option value={0x6F}>6F</option>

                        <option value={0x70}>70</option>
                        <option value={0x71}>71</option>
                        <option value={0x72}>72</option>
                        <option value={0x73}>73</option>
                        <option value={0x74}>74</option>
                        <option value={0x75}>75</option>
                        <option value={0x76}>76</option>
                        <option value={0x77}>77</option>
                        <option value={0x78}>78</option>
                        <option value={0x79}>79</option>
                        <option value={0x7A}>7A</option>
                        <option value={0x7B}>7B</option>
                        <option value={0x7C}>7C</option>
                        <option value={0x7D}>7D</option>
                        <option value={0x7E}>7E</option>
                    </select>
                </label>
            </fieldset>
        );
    }
}

export default BlofeldParameters;

