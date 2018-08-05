import React, { Component } from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import {
    func,
    number,
    object,
    string,
} from 'prop-types';
import axios, { CancelToken } from 'axios';
import AutocompleteInput from './lib/AutocompleteInput';
import Predictions from './lib/Predictions';

class GooglePlaceAutocomplete extends Component {
    static propTypes = {
        googleAPIKey: string,
        value: string,
        debounce: number,
        style: object,
        customStyle: object,
        inputStyle: object,
        predictionsStyle: object,
        placeholder: string,
        placeholderTextColor: string,
        underlineColorAndroid: string,
        onChangeText: func,
        onPredictions: func,
        onResult: func
    }

    static defaultProps = {
        debounce: 250,
        containerStyle: {},
        inputStyle: {},
        predictionsStyle: {},
    }

    _cancelTokenSource;

    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };

        this._cancelTokenSource = CancelToken.source();
    }

    componentDidMount() {
        this.setState({
            value: this.props.value
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    render() {
        return (
            <View style={[style.container, this.props.style]}>
                <AutocompleteInput
                    value={this.state.value}
                    inputStyle={this.props.inputStyle}
                    containerStyle={this.props.containerStyle}
                    placeholder={this.props.placeholder}
                    onChangeText={this._handleChangeText}
                    selectionColor={this.props.selectionColor}
                    underlineColorAndroid={this.props.underlineColorAndroid}
                    placeholderTextColor={this.props.placeholderTextColor}
                    debounce={this.props.debounce}
                    onChangeTextSettle={this._handleChangeTextSettle} />
                <Predictions
                    predictionsStyle={this.props.predictionsStyle}
                    predictions={this.state.predictions}
                    onPressPrediction={this._handlePressPrediction} />
            </View>
        );
    }

    _handleChangeText = (value) => {
        this.setState({value});

        // Fire event
        if (this.props.onChangeText) {
            this.props.onChangeText(value);
        }
    }

    _handleChangeTextSettle = () => {
        if (this.state.value.length > 0) {
            // Get predictions
            this._getPredictions(this.state.value)
            .then(response => {
                if (response && response.data) {
                       this._predictions(response.data.features);
                }
            })
            .catch(error => {
                console.log('error', error);
            });
        } else {
            if (this.state.predictions && this.state.predictions.length > 0) {
                this._predictions([]);
            }
        }
    }

    _predictions(predictions) {
        this.setState({predictions});

        // Fire event
        if (this.props.onPredictions) {
            this.props.onPredictions(predictions);
        }
    }

    _handlePressPrediction = (prediction) => {
        console.log(prediction);
        this.props.onResult(prediction);
//         // Get more detail about the place
//         this._request('/place/details', {
//             placeid: prediction.place_id
//         })
//         .then(response => {
//             if (response && response.data) {
//                 if (response.data.status === 'OK') {
//                     const {result} = response.data;

//                     // Fire event
//                     if (this.props.onResult) {
//                         this.setState({
//                           predictions:[],
//                         });
//                         this.props.onResult(result);
//                     }
//                 } else {
//                     console.error('Request Error:', response.data.error_message || response.data.status);
//                 }
//             }
//         })
//         .catch(error => {
//             console.log('error', error);
//         });
    }

    _getPredictions = (input) => {
        // Cancel any other requests
        this._cancelTokenSource.cancel('The "clean slate" protocol');
        this._cancelTokenSource = CancelToken.source();

        var params = {}
        params.q = input
        params.limit = 5

        return axios({
            url: `api`,
            method: 'get',
            baseURL: 'http://photon.komoot.de',
            params,
            cancelToken: this._cancelTokenSource.token
        })
        .catch(error => {
            if (axios.isCancel(error)) {
                console.log('Request Cancel:', error.message);
            } else {
                throw error;
            }
        });
    }
}

export const style = StyleSheet.create({
    container: {}
});

export default GooglePlaceAutocomplete;
