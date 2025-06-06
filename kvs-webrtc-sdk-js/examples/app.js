let ROLE = null; // Possible values: 'master', 'viewer', null
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
let LOG_LEVEL = 'info'; // Possible values: any value of LOG_LEVELS

$('#region').val("ap-northeast-2");
$('#channelName').val("Z9Ub77LPRqeZoc362r1LAw");
$('#accessKeyId').val("ASIAUCH4HQ4MU3J26SZK");
$('#secretAccessKey').val("rY6vgAoKdYToN9kqsHDGxN2v9Umo4/RQ3hVeNn2I");
$('#sessionToken').val("IQoJb3JpZ2luX2VjENL//////////wEaDmFwLW5vcnRoZWFzdC0yIkYwRAIgTVRNkrDd/fla3A5jbS1F9iooNkBVlrnYKyvmPQGEipQCIGDoDY3wswchO7Eq0irlt6f9ACkXLpL8r077QvP5Nq//KrkECJv//////////wEQBRoMMjc5NzAxODQ5ODgxIgx1qwvlrp/qWBU8WxYqjQR9prJeNWd1TcWcQUmFkqnKj5sB8LEpPKcSvy+MVkfduvHmg4woeASB7SWnJLNkVG9rvjyq0FE0FL96YhsNC7r58rEG4i0K+xCkgl1bwXbfuBD452sUAIjOEpoiWB30kejalqkKG77yduuJjj1FSLd8TWS0aQkFvHcbOJdOCmQxUbPyulavBXIdQlqfEV7dRzEObygNvluq09eBi/wWWKfVvBx6acamje6szL6IGxWwJEeXonUQJcwdmgCywu6sa68CX06znmKy+VgVY7bHudEBW2qjD4zZJ0XZrRuThUKcFC03xfGiKjQKFfe7EJmVPBbJRBxB5//vjzIsMYOpS4EmBDXeZ6XckXAWaXJfE3ahyN3Swsb7eDyiLvM6CHBdCQ/b9Dxa+a5My4s4DOh6Lln2KyYQpy6C/rfBO+SOnRE0OSz2VzfDSn5dk1yrn9JH//QBv4lVP14A1CjQgFzXzB5tvMCsCwvH0kfxpnykLoqF7WTlCNLRQ7jfpCBQAXXOF0h7SZdHAOGU8vatkdyAdf/sMnxikZMf6VVS0u/hrtHn/wsWbeZevkmwCObotWjBQYD4Un29hJjPO4qn7yxoHM1sdsGJRmfIqnn/NGkUSa69JaBzt0iGIzY4Yn0rYp0+chOW5ZPR4j2ka76WcIIysCqiw0TxsuOW64aKYKbkjzAnfVwpv4BIcfSHBqKm0pwwtoyBrgY6hgLxzZWE+g3AwaXm9TQpsHNhkAWqeh4kt+JMbCpKetUNldBWczYkNTPeh7ZbJorZhEmwhyqa73snMaivnQBt7VJ3Ohrs5X8jHMipR/w52yQOxyzFa8BtFuV1ZiO+0d7cQk3H9qTcDUff5e5aNjzKDExH7cpCiB7UR/WrUcMfWP7k1+bZfpu0RQNQ8J/gd5+soqzF2yoFBgm9SRZZNGXXb5dD6unKvFLNsUpgPuaV/lbypaM4fKD6KgnONU0jwK1owuw8XOfGSF7mBGneuxrH81pa7lT/Z7Sh/eivwUbkqWdKtq8oSe565v1zCIWX7xT0nsfmIWfUhsg6htZl2oHJ81i+2iECwbUT");


function configureLogging() {
    function log(level, messages) {
        const text = messages
            .map(message => {
                if (message instanceof Error) {
                    const { stack, ...rest } = message;
                    if (Object.keys(rest).length === 0) {
                        if (stack) {
                            return stack;
                        } else {
                            return message;
                        }
                    }
                    return `${JSON.stringify(rest, null, 2)}\n${stack}`;
                } else if (typeof message === 'object') {
                    return JSON.stringify(message, null, 2);
                } else if (message === undefined) {
                    return 'undefined';
                } else {
                    return message;
                }
            })
            .join(' ');

        const logLine = $(`<div class="${level.toLowerCase()}">`).text(`[${new Date().toISOString()}] [${level}] ${text}\n`);
        if (LOG_LEVELS.indexOf(LOG_LEVEL) > LOG_LEVELS.indexOf(level.toLowerCase())) {
            logLine.addClass('d-none');
        }
        $('#logs').append(logLine);
        const logsContainer = document.getElementById('logs');
        logsContainer.scrollTo(0, logsContainer.scrollHeight);
    }

    console._error = console.error;
    console.error = function(...rest) {
        log('ERROR', Array.prototype.slice.call(rest));
        console._error.apply(this, rest);
    };

    console._warn = console.warn;
    console.warn = function(...rest) {
        log('WARN', Array.prototype.slice.call(rest));
        console._warn.apply(this, rest);
    };

    console._log = console.log;
    console.log = function(...rest) {
        log('INFO', Array.prototype.slice.call(rest));
        console._log.apply(this, rest);
    };

    console._debug = console.debug;
    console.debug = function(...rest) {
        log('DEBUG', Array.prototype.slice.call(rest));
        console._debug.apply(this, rest);
    };
}

function getRandomClientId() {
    return Math.random()
        .toString(36)
        .substring(2)
        .toUpperCase();
}

function getFormValues() {
    return {
        region: $('#region').val(),
        channelName: $('#channelName').val(),
        clientId: $('#clientId').val() || getRandomClientId(),
        sendVideo: $('#sendVideo').is(':checked'),
        sendAudio: $('#sendAudio').is(':checked'),
        streamName: $('#streamName').val(),
        ingestMedia: $('#ingest-media').is(':checked'),
        showJSSButton: $('#show-join-storage-session-button').is(':checked'),
        openDataChannel: $('#openDataChannel').is(':checked'),
        widescreen: $('#widescreen').is(':checked'),
        fullscreen: $('#fullscreen').is(':checked'),
        useTrickleICE: $('#useTrickleICE').is(':checked'),
        natTraversalDisabled: $('#natTraversalDisabled').is(':checked'),
        forceSTUN: $('#forceSTUN').is(':checked'),
        forceTURN: $('#forceTURN').is(':checked'),
        accessKeyId: $('#accessKeyId').val(),
        endpoint: $('#endpoint').val() || null,
        secretAccessKey: $('#secretAccessKey').val(),
        sessionToken: $('#sessionToken').val() || null,
        enableDQPmetrics: $('#enableDQPmetrics').is(':checked'),
        sendHostCandidates: $('#send-host').is(':checked'),
        acceptHostCandidates: $('#accept-host').is(':checked'),
        sendRelayCandidates: $('#send-relay').is(':checked'),
        acceptRelayCandidates: $('#accept-relay').is(':checked'),
        sendSrflxCandidates: $('#send-srflx').is(':checked'),
        acceptSrflxCandidates: $('#accept-srflx').is(':checked'),
        sendPrflxCandidates: $('#send-prflx').is(':checked'),
        acceptPrflxCandidates: $('#accept-prflx').is(':checked'),
        sendTcpCandidates: $('#send-tcp').is(':checked'),
        acceptTcpCandidates: $('#accept-tcp').is(':checked'),
        sendUdpCandidates: $('#send-udp').is(':checked'),
        acceptUdpCandidates: $('#accept-udp').is(':checked'),
    };
}

function toggleDataChannelElements() {
    if (getFormValues().openDataChannel) {
        $('.datachannel').removeClass('d-none');
    } else {
        $('.datachannel').addClass('d-none');
    }
}

function onStatsReport(report) {
    // Only print these to the console, as this prints a LOT of stuff.
    console._debug('[STATS]', Object.fromEntries([...report.entries()]));
}

function onStop() {
    if (!ROLE) {
        return;
    }

    if (ROLE === 'master') {
        stopMaster();
        $('#master').addClass('d-none');
        $('#master .remote-view').removeClass('d-none');
        $('#master .remote').removeClass('d-none');
    } else {
        stopViewer();
        $('#viewer').addClass('d-none');
    }

    if (getFormValues().enableDQPmetrics) {
        $('#dqpmetrics').addClass('d-none');
        $('#webrtc-live-stats').addClass('d-none');
    }

    $('#form').removeClass('d-none');
    $('#join-storage-session-button').addClass('d-none');
    ROLE = null;
}

window.addEventListener('beforeunload', onStop);

window.addEventListener('error', function(event) {
    console.error(event.message);
    event.preventDefault();
});

window.addEventListener('unhandledrejection', function(event) {
    console.error(event.reason.toString());
    event.preventDefault();
});

configureLogging();

$('#master-button').click(async () => {
    const form = $('#form');
    if (!form[0].checkValidity()) {
        return;
    }
    ROLE = 'master';
    form.addClass('d-none');
    $('#master').removeClass('d-none');

    const localView = $('#master .local-view')[0];
    const remoteView = $('#viewer-view-holder')[0];
    const localMessage = $('#master .local-message')[0];
    const remoteMessage = $('#master .remote-message')[0];
    const formValues = getFormValues();

    $(remoteMessage).empty();
    localMessage.value = '';
    toggleDataChannelElements();

    printFormValues(formValues);

    startMaster(localView, remoteView, formValues, onStatsReport, event => {
        remoteMessage.append(`${event.data}\n`);
    });
});

function printFormValues(formValues) {
    const copyOfForm = Object.assign({}, formValues);
    copyOfForm.accessKeyId = copyOfForm.accessKeyId.replace(/./g, '*');
    copyOfForm.secretAccessKey = copyOfForm.secretAccessKey.replace(/./g, '*');
    copyOfForm.sessionToken = copyOfForm.sessionToken?.replace(/./g, '*');
    console.log('[FORM_VALUES] Running the sample with the following options:', copyOfForm);
}

$('#clear-logs').click(() => {
    $('#logs').empty();
});

$('#stop-master-button').click(onStop);

$('#viewer-button').click(async () => {
    const form = $('#form');
    if (!form[0].checkValidity()) {
        return;
    }
    ROLE = 'viewer';
    form.addClass('d-none');
    $('#viewer').removeClass('d-none');

    const localView = $('#viewer .local-view')[0];
    const remoteView = $('#viewer .remote-view')[0];
    const localMessage = $('#viewer .local-message')[0];
    const remoteMessage = $('#viewer .remote-message')[0];
    const formValues = getFormValues();

    if (formValues.enableDQPmetrics) {
        $('#dqpmetrics').removeClass('d-none');
        $('#webrtc-live-stats').removeClass('d-none');
    }

    $(remoteMessage).empty();
    localMessage.value = '';
    toggleDataChannelElements();

    printFormValues(formValues);

    startViewer(localView, remoteView, formValues, onStatsReport, event => {
        remoteMessage.append(`${event.data}\n`);
    });
});

$('#stop-viewer-button').click(onStop);

$('#create-channel-button').click(async () => {
    const formValues = getFormValues();

    createSignalingChannel(formValues);
});

$('#master .send-message').click(async () => {
    const masterLocalMessage = $('#master .local-message');
    if (sendMasterMessage(masterLocalMessage.val())) {
        masterLocalMessage.val('');
    }
});

$('#viewer .send-message').click(async () => {
    const viewerLocalMessage = $('#viewer .local-message');
    if (sendViewerMessage(viewerLocalMessage.val())) {
        viewerLocalMessage.val('');
    }
});

$('#more-logs').click(async () => {
    const logElement = $('#logs');
    logElement.height(logElement.height() + 50);
});

$('#less-logs').click(async () => {
    const logElement = $('#logs');
    logElement.height(Math.max(100, logElement.height() - 50));
});

async function logLevelSelected(event) {
    LOG_LEVEL = event.target.getAttribute('data-level').toLowerCase();

    // Change which button is selected
    for (const child of $('#tabs').children()) {
        child.setAttribute('class', event.target.id === child.id ? 'btn btn-primary' : 'btn btn-light');
    }

    // Make the logs hidden and shown based on the selected level
    $('#logs > div').each((idx, child) => {
        if (LOG_LEVELS.indexOf(LOG_LEVEL) <= LOG_LEVELS.indexOf(child.classList[0])) {
            child.classList.remove('d-none');
        } else {
            child.classList.add('d-none');
        }
    });
}

// Fetch regions
fetch('https://api.regional-table.region-services.aws.a2z.com/index.jsons')
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`${res.status}: ${res.statusText}`);
    })
    .then(data => {
        data?.prices
            ?.filter(serviceData => serviceData?.attributes['aws:serviceName'] === 'Amazon Kinesis Video Streams')
            .map(kinesisVideoServiceData => kinesisVideoServiceData?.attributes['aws:region'])
            .sort()
            .forEach(region => {
                $('#regionList').append(
                    $('<option>', {
                        value: region,
                        text: region,
                    }),
                );
            });
        $('#region').attr('list', 'regionList');
        console.log('[FETCH-REGIONS] Successfully fetched regions!');
    })
    .catch(err => {
        console.error('[FETCH-REGIONS] Encountered error fetching regions', err);
    });

// Region verification
$('#region').on('focusout', event => {
    const region = event.target.value;
    let found = false;
    let anyRegions = false;
    for (const child of $('dataList').children()) {
        anyRegions = true;
        if (child.value === region) {
            found = true;
            break;
        }
    }
    if (!anyRegions) {
        return;
    }

    const regionElement = $('#region');

    if (found) {
        regionElement.addClass('is-valid');
        regionElement.removeClass('is-invalid');
    } else {
        if (!region) {
            $('#region-invalid-feedback').text('Please enter a region!');
        } else {
            // The dataset used mentions that it does not guarantee accuracy. In the case that
            // it does not contain a certain region needed, we can still input regions needed.
            $('#region-invalid-feedback').text('This region is not in the list of fetched regions!');
            console.warn(`[REGION-VALIDATION] The region entered: \"${region}\" may be invalid!`);
        }

        regionElement.addClass('is-invalid');
        regionElement.removeClass('is-valid');
    }
});

function addViewerTrackToMaster(viewerId, track) {
    $('#empty-video-placeholder')?.remove();

    $('#viewer-view-holder')
        .find('#' + viewerId)
        ?.remove();

    const container = $(`<div id="${viewerId}"></div>`);
    const video = $(`<video autoPlay playsInline controls title="${viewerId}"></video>`);
    video.addClass('remote-view');

    const title = $(`<p>${viewerId}</p>`);

    container.append(video);
    container.append(title);

    video[0].srcObject = track;

    $('#viewer-view-holder').append(container);
}

function removeViewerTrackFromMaster(viewerId) {
    $('#viewer-view-holder')
        .find('#' + viewerId)
        .remove();

    // Put an empty video player there, so it doesn't look empty
    if ($('#viewer-view-holder').children().length === 1) {
        $('#viewer-view-holder').append(`<video id="empty-video-placeholder" autoPlay playsInline controls title="${viewerId}"></video>`);
    }
}

async function printPeerConnectionStateInfo(event, logPrefix, remoteClientId) {
    const rtcPeerConnection = event.target;
    console.debug(logPrefix, 'PeerConnection state:', rtcPeerConnection.connectionState);
    if (rtcPeerConnection.connectionState === 'connected') {
        console.log(logPrefix, 'Connection to peer successful!');
        const stats = await rtcPeerConnection.getStats();
        if (!stats) return;

        rtcPeerConnection.getSenders().map(sender => {
            const trackType = sender.track?.kind;
            if (sender.transport) {
                const iceTransport = sender.transport.iceTransport;
                if (iceTransport) {
                    const logSelectedCandidate = () =>
                        console.debug(`Chosen candidate pair (${trackType || 'unknown'}):`, iceTransport.getSelectedCandidatePair());
                    iceTransport.onselectedcandidatepairchange = logSelectedCandidate;
                    logSelectedCandidate();
                }
            } else {
                console.error('Failed to fetch the candidate pair!');
            }
        });
    } else if (rtcPeerConnection.connectionState === 'failed') {
        if (remoteClientId) {
            removeViewerTrackFromMaster(remoteClientId);
        }
        console.error(logPrefix, `Connection to ${remoteClientId || 'peer'} failed!`);
        onPeerConnectionFailed();
    }
}

// Read/Write all of the fields to/from localStorage so that fields are not lost on refresh.
const urlParams = new URLSearchParams(window.location.search);
const fields = [
    { field: 'channelName', type: 'text' },
    { field: 'clientId', type: 'text' },
    { field: 'region', type: 'text' },
    { field: 'accessKeyId', type: 'text' },
    { field: 'secretAccessKey', type: 'text' },
    { field: 'sessionToken', type: 'text' },
    { field: 'endpoint', type: 'text' },
    { field: 'sendVideo', type: 'checkbox' },
    { field: 'sendAudio', type: 'checkbox' },
    { field: 'streamName', type: 'text' },
    { field: 'ingest-media', type: 'checkbox' },
    { field: 'show-join-storage-session-button', type: 'checkbox' },
    { field: 'widescreen', type: 'radio', name: 'resolution' },
    { field: 'fullscreen', type: 'radio', name: 'resolution' },
    { field: 'openDataChannel', type: 'checkbox' },
    { field: 'useTrickleICE', type: 'checkbox' },
    { field: 'natTraversalEnabled', type: 'radio', name: 'natTraversal' },
    { field: 'forceSTUN', type: 'radio', name: 'natTraversal' },
    { field: 'forceTURN', type: 'radio', name: 'natTraversal' },
    { field: 'natTraversalDisabled', type: 'radio', name: 'natTraversal' },
    { field: 'enableDQPmetrics', type: 'checkbox' },
    { field: 'send-host', type: 'checkbox' },
    { field: 'accept-host', type: 'checkbox' },
    { field: 'send-relay', type: 'checkbox' },
    { field: 'accept-relay', type: 'checkbox' },
    { field: 'send-srflx', type: 'checkbox' },
    { field: 'accept-srflx', type: 'checkbox' },
    { field: 'send-prflx', type: 'checkbox' },
    { field: 'accept-prflx', type: 'checkbox' },
    { field: 'send-tcp', type: 'checkbox' },
    { field: 'accept-tcp', type: 'checkbox' },
    { field: 'send-udp', type: 'checkbox' },
    { field: 'accept-udp', type: 'checkbox' },
];

fields.forEach(({ field, type, name }) => {
    const id = '#' + field;

    // Read field from localStorage
    try {
        const localStorageValue = localStorage.getItem(field);
        if (localStorageValue) {
            if (type === 'checkbox' || type === 'radio') {
                $(id).prop('checked', localStorageValue === 'true');
            } else {
                $(id).val(localStorageValue);
            }
            $(id).trigger('change');
        }
    } catch (e) {
        /* Don't use localStorage */
    }

    // Read field from query string
    if (urlParams.has(field)) {
        paramValue = urlParams.get(field);
        if (type === 'checkbox' || type === 'radio') {
            $(id).prop('checked', paramValue === 'true');
        } else {
            $(id).val(paramValue);
        }
    }

    // Write field to localstorage on change event
    $(id).change(function() {
        try {
            if (type === 'checkbox') {
                localStorage.setItem(field, $(id).is(':checked'));
            } else if (type === 'radio') {
                fields
                    .filter(fieldItem => fieldItem.name === name)
                    .forEach(fieldItem => {
                        localStorage.setItem(fieldItem.field, fieldItem.field === field);
                    });
            } else {
                localStorage.setItem(field, $(id).val());
            }
        } catch (e) {
            /* Don't use localStorage */
        }
    });
});

/**
 * Determines whether the ICE Candidate should be added.
 * @param formValues Settings used.
 * @param candidate {RTCIceCandidate} iceCandidate to check
 * @returns true if the candidate should be added to the peerConnection.
 */
function shouldAcceptCandidate(formValues, candidate) {
    const { transport, type } = extractTransportAndType(candidate);

    if (!formValues.acceptUdpCandidates && transport === 'udp') {
        return false;
    }

    if (!formValues.acceptTcpCandidates && transport === 'tcp') {
        return false;
    }

    switch (type) {
        case 'host':
            return formValues.acceptHostCandidates;
        case 'srflx':
            return formValues.acceptSrflxCandidates;
        case 'relay':
            return formValues.acceptRelayCandidates;
        case 'prflx':
            return formValues.acceptPrflxCandidates;
        default:
            console.warn('ShouldAcceptICECandidate: Unknown candidate type:', candidate.type);
            return false;
    }
}

$('#natTraversalEnabled').on('click', () => {
    $('#accept-host').prop('checked', true);
    $('#send-host').prop('checked', true);
    $('#accept-relay').prop('checked', true);
    $('#send-relay').prop('checked', true);
    $('#accept-srflx').prop('checked', true);
    $('#send-srflx').prop('checked', true);
    $('#accept-prflx').prop('checked', true);
    $('#send-prflx').prop('checked', true);

    saveAdvanced();
});

$('#forceSTUN').on('click', () => {
    $('#accept-host').prop('checked', false);
    $('#send-host').prop('checked', false);
    $('#accept-relay').prop('checked', false);
    $('#send-relay').prop('checked', false);
    $('#accept-srflx').prop('checked', true);
    $('#send-srflx').prop('checked', true);
    $('#accept-prflx').prop('checked', false);
    $('#send-prflx').prop('checked', false);

    saveAdvanced();
});

$('#forceTURN').on('click', () => {
    $('#accept-host').prop('checked', false);
    $('#send-host').prop('checked', false);
    $('#accept-relay').prop('checked', true);
    $('#send-relay').prop('checked', true);
    $('#accept-srflx').prop('checked', false);
    $('#send-srflx').prop('checked', false);
    $('#accept-prflx').prop('checked', false);
    $('#send-prflx').prop('checked', false);

    saveAdvanced();
});

$('#natTraversalDisabled').on('click', () => {
    $('#accept-host').prop('checked', true);
    $('#send-host').prop('checked', true);
    $('#accept-relay').prop('checked', true);
    $('#send-relay').prop('checked', true);
    $('#accept-srflx').prop('checked', true);
    $('#send-srflx').prop('checked', true);
    $('#accept-prflx').prop('checked', true);
    $('#send-prflx').prop('checked', true);

    saveAdvanced();
});

function saveAdvanced() {
    $('#accept-host').trigger('change');
    $('#send-host').trigger('change');
    $('#accept-relay').trigger('change');
    $('#send-relay').trigger('change');
    $('#accept-srflx').trigger('change');
    $('#send-srflx').trigger('change');
    $('#accept-prflx').trigger('change');
    $('#send-prflx').trigger('change');
}

/**
 * Determines whether the ICE Candidate should be sent to the peer.
 * @param formValues Settings used.
 * @param candidate {RTCIceCandidate} iceCandidate to check
 * @returns true if the candidate should be sent to the peer.
 */
function shouldSendIceCandidate(formValues, candidate) {
    const { transport, type } = extractTransportAndType(candidate);

    if (!formValues.sendUdpCandidates && transport === 'udp') {
        return false;
    }

    if (!formValues.sendTcpCandidates && transport === 'tcp') {
        return false;
    }

    switch (type) {
        case 'host':
            return formValues.sendHostCandidates;
        case 'srflx':
            return formValues.sendSrflxCandidates;
        case 'relay':
            return formValues.sendRelayCandidates;
        case 'prflx':
            return formValues.sendPrflxCandidates;
        default:
            console.warn('ShouldSendICECandidate: Unknown candidate type:', candidate.type);
            return false;
    }
}

function randomString() {
    return Date.now().toString();
}

function extractTransportAndType(candidate) {
    const words = candidate.candidate.split(' ');

    if (words.length < 7) {
        console.error('Invalid ice candidate!', candidate);
        return false;
    }

    // https://datatracker.ietf.org/doc/html/rfc5245#section-15.1
    return { transport: words[2], type: words[7] };
}

$('#copy-logs').on('click', async function() {
    const logsResult = [];
    $('#logs')
        .children()
        // Only copy the logs that are visible
        .filter((_, element) => !element.getAttribute('class')?.includes('d-none'))
        .each(function() {
            logsResult.push(this.textContent);
        });
    navigator.clipboard.writeText(logsResult.join(''));
    $('#copy-tooltip').tooltip('show');
    $('#copy-logs').removeClass('btn-light');
    $('#copy-logs').addClass('btn-success');
    await new Promise(r => setTimeout(r, 1000));
    $('#copy-tooltip').tooltip('hide');
    $('#copy-logs').removeClass('btn-success');
    $('#copy-logs').addClass('btn-light');
});

$('#listStorageChannels').on('click', async function() {
    const formValues = getFormValues();
    listStorageChannels(formValues);
});

$('#update-media-storage-configuration-button').on('click', async function() {
    const formValues = getFormValues();
    updateMediaStorageConfiguration(formValues);
});

$('#describe-media-storage-configuration-button').on('click', async function() {
    const formValues = getFormValues();
    describeMediaStorageConfiguration(formValues);
});

$('#create-stream-modal').on('show.bs.modal', function() {
    // Set the stream name in the modal to the stream name.
    $('#create-stream-modal-stream-input').val($('#streamName').val());
});

$('#create-stream-modal-create-stream-button').on('click', async function() {
    await createStream({
        ...getFormValues(),
        streamName: $('#create-stream-modal-stream-input').val(),
        retentionInHours: $('#create-stream-modal-retention-input').val(),
    });
});

$('#join-storage-session-button').on('click', async function() {
    const formValues = getFormValues();
    joinStorageSessionManually(formValues);
});

// Enable tooltips
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();

    // Except the copy-logs tooltip
    $('#copy-tooltip').tooltip({ trigger: 'manual' });
});

// The page is all setup. Hide the loading spinner and show the page content.
$('.loader').addClass('d-none');
$('#main').removeClass('d-none');
console.log('Page loaded');
