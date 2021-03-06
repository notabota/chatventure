// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    setDoc,
    where
} from 'firebase/firestore';
import logger from 'morgan';
import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'request';
import MessengerPlatform from 'facebook-bot-messenger';

const
    FIREBASE_apiKey = process.env.FIREBASE_apiKey,
    FIREBASE_authDomain = process.env.FIREBASE_authDomain,
    FIREBASE_projectId = process.env.FIREBASE_projectId,
    FIREBASE_storageBucket = process.env.FIREBASE_storageBucket,
    FIREBASE_messagingSenderId = process.env.FIREBASE_messagingSenderId,
    FIREBASE_appId = process.env.FIREBASE_appId,
    FIREBASE_measurementId = process.env.FIREBASE_measurementId,

    FB_pageId = process.env.FB_pageId,
    FB_appId = process.env.FB_appId,
    FB_appSecret = process.env.FB_appSecret,
    FB_validationToken = process.env.FB_validationToken,
    FB_pageToken = process.env.FB_pageToken;

const firebaseConfig = {
    apiKey: FIREBASE_apiKey,
    authDomain: FIREBASE_authDomain,
    projectId: FIREBASE_projectId,
    storageBucket: FIREBASE_storageBucket,
    messagingSenderId: FIREBASE_messagingSenderId,
    appId: FIREBASE_appId,
    measurementId: FIREBASE_measurementId,
};

// Initialize Firebase
// import serviceKey from 'lqdchatventure-firebase-adminsdk-p777u-b92ccc8457.json';

const initFirebase = initializeApp(firebaseConfig);

// Initialize Cloud Firestore through Firebase
const db = getFirestore();

var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var server = http.createServer(app);

var bot = MessengerPlatform.create({
    pageID: FB_pageId,
    appID: FB_appId,
    appSecret: FB_appSecret,
    validationToken: FB_validationToken,
    pageToken: FB_pageToken
}, server);

// app.use(bot.webhook('/webhook'));
// bot.on(MessengerPlatform.Events.MESSAGE, function (userId, message) {
//     // add code below.
// });

app.listen(process.env.PORT || 3000);

var timeout = {};
var help_list = [
    'https://i.imgur.com/SfBllHn.png',
    'https://i.imgur.com/6xaJvKh.png',
    'https://i.imgur.com/Lk6Gy6c.png',
    'https://i.imgur.com/6loTnSI.png',
    'https://i.imgur.com/D67W2gm.png',
    'https://i.imgur.com/yTee0uQ.png',
    'https://i.imgur.com/AtwqtLi.png',
    'https://i.imgur.com/tzxBegc.png',
    'https://i.imgur.com/VSVc3t6.png',
    'https://i.imgur.com/4oAyWRR.png',
    'https://i.imgur.com/jQOZy50.png',
    'https://i.imgur.com/MulVA9m.png',
    'https://i.imgur.com/vC49OV4.png',
    'https://i.imgur.com/jXkyqHw.png',
    'https://i.imgur.com/2Lz39OL.png',
    'https://i.imgur.com/WVsKaAL.png',
]

app.get('/', (req, res) => {
    res.send('Heh');
});

//Validation token facebook webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === FB_validationToken) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

// ??o???n code x??? l?? khi c?? ng?????i nh???n tin cho bot
app.post('/webhook', function (req, res) {
        //sendReq(req);
        (async () => {
                try {
                    var entries = req.body.entry;
                    for (var entry of entries) {
                        var messaging = entry.messaging;
                        for (var message of messaging) {
                            // // console.log('messages');

                            let senderId = message.sender.id;

                            // // console.log('Async');
                            var senderData = await getDoc(doc(db, 'users', senderId));
                            var command_text = true;

                            if (message.message || message.postback || message.reaction) {

                                if (!senderData.exists()) {
                                    if (senderId === '105254598184667') return;

                                    // Check k???t n???i l???n ?????u, setup profile
                                    await sendTextMessage(senderId, 'Hey. L???n ?????u? B???n c?? th??? s??? mu???n ' +
                                        '?????c qua h?????ng d???n b???ng c??ch g?? \'help\' tr?????c ?????y'
                                    );
                                    await sendTextMessage(senderId, '?????u ti??n b???n c?? th??? s??? mu???n ?????t nickname c???a' +
                                        ' b???n th??n b???ng c?? ph??p : \n nickname < nickname c???a b???n > (M???c ?????nh : \'???n danh\')');

                                    await sendTextMessage(senderId, "Ho???c l?? thi???t l???p gi???i t??nh c???a m??nh b???ng l???nh \n gioitinh + < nam | nu | khongdat >\n(M???c ?????nh : khongdat)");

                                    await sendQuickReply(senderId, "Thi???t l???p profile c???a b???n c?? th??? gi??p d??? d??ng t??m ki???m hi???u qu??? v?? h???p l?? h??n " +
                                        "cho b???n v?? m???i ng?????i");

                                    await getProfile(senderId).then(async function (profile) {
                                        // // console.log('First connected');

                                        let docRef = await addDoc(collection(db, 'global_vars', 'masks', 'users'), {
                                            id: senderId
                                        });

                                        await setDoc(doc(db, 'users', senderId), {
                                            nickname: '???n danh',
                                            gender: profile.gender === undefined ? null : profile.gender,
                                            fb_link: null,
                                            history_requesting_timestamp: null,
                                            history_requesting_id: null,
                                            last_connect: null,
                                            id: senderId,
                                            topic: null,
                                            partner: null,
                                            crr_timestamp: null,
                                            age: null,
                                            age_range: null,
                                            tags: [],
                                            find_tags: [],
                                            find_gender: null,
                                            blocked: [],
                                            queued_timestamp: null,
                                            answered_questions: [],
                                            // asked_questions: [],
                                            listen_to_queue: true,
                                            exclude_last_connected: false,
                                            mask_id: docRef.id,
                                            qa_requesting_id: null,
                                            crr_question: null,
                                            setup_gender: false
                                        });

                                        await setDoc(doc(db, 'names', profile.name + ' ' + profile.id), {
                                            id: senderId
                                        });

                                    }).catch((err) => console.log(err));
                                    senderData = await getDoc(doc(db, 'users', senderId));
                                }
                            }
                            if (message.message) {

                                // N???u ng?????i d??ng g???i tin nh???n ?????n
                                if (message.message.text) {

                                    var text = message.message.text;
                                    // // console.log(senderId, text);

                                    await setDoc(doc(db, 'users', senderId), {
                                        last_text: text,
                                    }, {merge: true});

                                    if (checkIfParameterCmd(text)) {
                                        let command = text.substr(0, text.indexOf(' '));
                                        let parameter = text.substr(text.indexOf(' ') + 1);

                                        if (command.toLowerCase() === 'gioitinh') {

                                            if (parameter !== 'nam' && parameter !== 'nu' && parameter !== 'khongdat') {
                                                await sendQuickReplyGender(senderId, 'Gi???i t??nh kh??ng h???p l???. C??c gi???i t??nh c?? th???' +
                                                    ' ?????t : nam | nu | khongdat');
                                                return;
                                            }

                                            let set_gender;
                                            if (parameter === 'nam') set_gender = 'male';
                                            else if (parameter === 'nu') set_gender = 'female';
                                            else set_gender = null;

                                            await setDoc(doc(db, 'users', senderId), {

                                                gender: set_gender,
                                                setup_gender: true

                                            }, {merge: true});

                                            await sendQuickReply(senderId, 'Gi???i t??nh c???a b???n ???? ???????c ?????t l?? : ' + parameter);

                                            return;
                                        }

                                    }

                                    if (senderData.data().setup_gender === undefined || !senderData.data().setup_gender) {
                                        await sendTextMessage(senderId, "Tr?????c khi b???t ?????u s??? d???ng h??? th???ng, h??y thi???t " +
                                            "l???p gi???i t??nh c???a b???n th??n tr?????c b???ng c?? ph??p gioitinh + nam / nu / khongdat (Update tr?????c 8/3) \n V?? d??? : gioitinh nu");
                                    } else if (['ketnoi', 'timkiem', 'k???t n???i', 't??m ki???m', 'ket noi', 'tim kiem', 'b???t ?????u', 'batdau', 'bat dau']
                                        .includes(text.toLowerCase())) {
                                        try {
                                            await addToQueue(senderId, senderData, null);
                                        } catch
                                            (e) {
                                            // Deal with the fact the chain failed
                                            // console.log('Error somewhere:', e);
                                        }

                                    } else if (['profile', 'th??ng tin', 'h??? s??', 'thong tin', 'ho so', 'thongtin', 'hoso'].includes(text.toLowerCase())) {

                                        let link = 'https://lqdchatventure-web.herokuapp.com/profile?id=' + senderData.data().mask_id;
                                        let elements = [{
                                            'title': 'Profile c???a b???n',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'Profile c???a b???n'
                                                }
                                            ]
                                        }];
                                        await sendList(senderId, elements);

                                    } else if (['phonggapmat', 'phong gap mat', 'ph??ng g???p m???t'].includes(text.toLowerCase())) {

                                        let link = 'https://lqdchatventure-web.herokuapp.com/meeting_rooms?id=' + senderData.data().mask_id;

                                        let elements = [{
                                            'title': 'Danh s??ch ph??ng g???p m???t',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'Nh???n v??o ????y'
                                                }
                                            ]
                                        }];

                                        await sendList(senderId, elements);

                                    } else if (['game', 'phong game', 'ph??ng game'].includes(text.toLowerCase())) {

                                        let link = 'https://lqdchatventure-web.herokuapp.com/game_rooms?id=' + senderData.data().mask_id;

                                        let elements = [{
                                            'title': 'Danh s??ch ph??ng game',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'Nh???n v??o ????y'
                                                }
                                            ]
                                        }];

                                        await sendList(senderId, elements);

                                    } else if (['tho??t', 'thoat', 'k???t th??c', 'ket thuc', 'ketthuc'].includes(text.toLowerCase())) {

                                        let code = await getOut(senderId, senderData);
                                        if (code === 0)
                                            await sendQuickReply(senderId, 'Kh??ng th??? tho??t khi ch??a k???t n???i ho???c trong h??ng ?????i');

                                    } else if (['timkiemnangcao', 't??m ki???m n??ng cao', 'tim kiem nang cao', 'advance search', 'advance_search', 'advancesearch']
                                        .includes(text.toLowerCase())) {
                                        let link = 'https://lqdchatventure-web.herokuapp.com/advance_search?id=' + senderData.data().mask_id;
                                        let elements = [{
                                            'title': 'S???a ?????i c??c thi???t l???p t??m ki???m n??ng cao',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'T??m ki???m n??ng cao'
                                                }
                                            ]
                                        }];
                                        await sendList(senderId, elements);
                                    } else if (['l???nh', 'lenh'].includes(text.toLowerCase())) {

                                        //Query cho l???ch s???
                                        let remove_elements = [];
                                        let command_elements = [];
                                        let queryHistory = query(collection(db, 'users', senderId, 'history')
                                            , orderBy('timestamp', 'desc')
                                            , limit(10)
                                        )

                                        let querySnapshot = await getDocs(queryHistory);

                                        let i = querySnapshot.size;

                                        // // console.log('Size : ', i);

                                        if (i === 0) await sendQuickReply(senderId, 'B???n ch??a tham gia cu???c tr?? chuy???n n??o');

                                        //Setup Buttons + Elements
                                        querySnapshot.forEach((gettedDoc) => {

                                            let data = gettedDoc.data();
                                            let command_buttons = [];
                                            let title;

                                            title = data.nickname === null
                                                ? 'Ng?????i l???' : data.nickname;
                                            if (data.set_nickname !== null) title += ' ( ' + data.set_nickname + ' )';

                                            let remove_buttons = [
                                                {
                                                    'type': 'postback',
                                                    'title': 'X??a cu???c tr?? chuy???n',
                                                    'payload': 'DELETE_HISTORY_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                },
                                                {
                                                    'type': 'postback',
                                                    'title': 'Block',
                                                    'payload': 'BLOCK_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                }
                                            ]

                                            if (i === querySnapshot.size && senderData.data().crr_timestamp !== null) {
                                                command_buttons = [
                                                    {
                                                        'type': 'postback',
                                                        'title': 'G???i in4',
                                                        'payload': 'POST_INFO_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                    }
                                                ];
                                            } else {
                                                if (data.requesting) {
                                                    command_buttons = [
                                                        {
                                                            'type': 'postback',
                                                            'title': '?????ng ?? k???t n???i',
                                                            'payload': 'ACCEPT_REQUEST_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                        },
                                                        {
                                                            'type': 'postback',
                                                            'title': 'T??? ch???i y??u c???u',
                                                            'payload': 'REJECT_REQUEST_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                        }
                                                    ]
                                                } else if (data.requested) {
                                                    command_buttons = [
                                                        {
                                                            'type': 'postback',
                                                            'title': 'H???y y??u c???u',
                                                            'payload': 'REMOVE_REQUEST_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                        }
                                                    ]
                                                } else {
                                                    command_buttons = [
                                                        {
                                                            'type': 'postback',
                                                            'title': 'G???i l???i m???i k???t n???i',
                                                            'payload': 'CONNECT_REQUEST_PAYLOAD ' + gettedDoc.id + ' ' + data.psid
                                                        }
                                                    ]
                                                }
                                            }

                                            if (data.fb_link !== null) {
                                                command_buttons.push(
                                                    {
                                                        'type': 'web_url',
                                                        'title': 'M??? link Facebook',
                                                        'url': data.fb_link,
                                                    }
                                                )
                                            }

                                            command_elements.push(
                                                {
                                                    'title': title,
                                                    'subtitle': timeConverter(data.timestamp),
                                                    'default_action': {
                                                        'type': 'web_url',
                                                        'url': data.fb_link !== null ? data.fb_link
                                                            : 'https://www.facebook.com/lqdchatventure',
                                                        'webview_height_ratio': 'full',
                                                    },
                                                    'buttons': command_buttons
                                                }
                                            );
                                            i--;

                                            remove_elements.push(
                                                {
                                                    'title': title,
                                                    'subtitle': timeConverter(data.timestamp),
                                                    'default_action': {
                                                        'type': 'web_url',
                                                        'url': data.fb_link !== null ? data.fb_link
                                                            : 'https://www.facebook.com/',
                                                        'webview_height_ratio': 'full',
                                                    },
                                                    'buttons': remove_buttons
                                                }
                                            );
                                        });
                                        await sendList(senderId, command_elements);
                                        await sendList(senderId, remove_elements);
                                    } else if (['y??u c???u k???t n???i', 'yeu cau ket noi', 'yeucauketnoi'].includes(text.toLowerCase())) {

                                        let historySnap = await getDocs(query(collection(db, 'users'),
                                            where('history_requesting_id', '==', senderId),
                                            orderBy('timestamp', 'desc'),
                                            limit(10)));

                                        let history_elements = []

                                        historySnap.forEach((docSnap) => {
                                            let title = docSnap.data().nickname === null
                                                ? 'Ng?????i l???' : docSnap.data().nickname;

                                            (async () => {
                                                let history_buttons = [
                                                    {
                                                        'type': 'postback',
                                                        'title': '?????ng ?? k???t n???i',
                                                        'payload': 'ACCEPT_REQUEST_PAYLOAD ' + docSnap.data().history_requesting_timestamp +
                                                            ' ' + docSnap.id
                                                    },
                                                    {
                                                        'type': 'postback',
                                                        'title': 'T??? ch???i y??u c???u',
                                                        'payload': 'REJECT_REQUEST_PAYLOAD ' + docSnap.data().history_requesting_timestamp +
                                                            ' ' + docSnap.id
                                                    }
                                                ]

                                                history_elements.push(
                                                    {
                                                        'title': title,
                                                        'subtitle': timeConverter(docSnap.data().queued_timestamp),
                                                        'buttons': history_buttons
                                                    }
                                                );

                                            })();
                                        });

                                        if (history_elements.length === 0) {
                                            await sendTextMessage(senderId, "B???n hi??n ch??a c?? y??u c???u k???t n???i qua l???ch s??? t??? ai c???");
                                        } else {
                                            await sendTextMessage(senderId, "Y??u c???u k???t n???i qua l???ch s??? cu???c tr?? chuy???n");
                                            await sendList(senderId, history_elements);
                                        }

                                        let qaSnap = await getDocs(query(collection(db, 'users'),
                                            where('history_requesting_id', '==', senderId),
                                            orderBy('timestamp', 'desc'),
                                            limit(10)));

                                        let qa_elements = []

                                        qaSnap.forEach((docSnap) => {
                                            (async () => {

                                                let title = docSnap.data().nickname === null
                                                    ? 'Ng?????i l???' : docSnap.data().nickname;

                                                let qa_buttons = [
                                                    {
                                                        'type': 'postback',
                                                        'title': '?????ng ?? k???t n???i',
                                                        'payload': 'QA_ACCEPT_REQUEST_PAYLOAD ' + docSnap.id
                                                    },
                                                    {
                                                        'type': 'postback',
                                                        'title': 'T??? ch???i y??u c???u',
                                                        'payload': 'QA_REJECT_REQUEST_PAYLOAD ' + docSnap.id
                                                    }
                                                ]

                                                qa_elements.push(
                                                    {
                                                        'title': title,
                                                        'subtitle': timeConverter(docSnap.data().queued_timestamp),
                                                        'buttons': qa_buttons
                                                    }
                                                );
                                            })();
                                        });

                                        if (qa_elements.length === 0) {
                                            await sendTextMessage(senderId, "B???n hi??n ch??a c?? y??u c???u k???t n???i qua c??u h???i t??? ai c???");
                                        } else {
                                            await sendTextMessage(senderId, "Y??u c???u k???t n???i qua c??u h???i");
                                            await sendList(senderId, qa_elements);
                                        }

                                    } else if (['t??m nam', 'tim nam', 'timnam'].includes(text.toLowerCase())) {

                                        await addToQueue(senderId, senderData, 'male');

                                    } else if (['t??m n???', 'tim nu', 'timnu'].includes(text.toLowerCase())) {

                                        await addToQueue(senderId, senderData, 'female');

                                    } else if (['tr??? gi??p', 'tro giup', 'trogiup', 'help'].includes(text.toLowerCase())) {
                                        for (let help in help_list) {
                                            await bot.sendImageMessage(senderId, help_list[help]);
                                        }
                                        await sendQuickReply(senderId, "Ch??o m???ng ?????n v???i Chatventure");
                                    } else if (['t??m c??u h???i', 'tim cau hoi', 'timcauhoi'].includes(text.toLowerCase())) {

                                        let docSnap = await getDoc(doc(db, 'global_vars', 'qa'));
                                        let questIdList = [];
                                        for (let i = 0; i < docSnap.data().questions_count; i++) {
                                            // console.log(i, questIdList)

                                            if (senderData.data().answered_questions.includes(i)) continue;

                                            questIdList.push(i);
                                        }

                                        if (questIdList.length === 0) {
                                            await sendTextMessage(senderId, "Hi???n kh??ng c??n c??u h???i n??o m?? b???n ch??a tr??? l???i. H??y ?????n ????y " +
                                                "v??o l??c kh??c")
                                        } else {
                                            let randQuestion = Math.floor(Math.random() * questIdList.length);


                                            let querySnapshot = await getDocs(query(collection(db, 'questions'),
                                                where('random_id', '==', randQuestion)));

                                            querySnapshot.forEach((docSnap) => {
                                                (async () => {
                                                    // doc.data() is never undefined for query doc snapshots
                                                    // console.log(doc.id, " => ", doc.data());

                                                    await sendQuickReply(senderId, 'C??u h???i : ' + docSnap.data().text);

                                                    await setDoc(doc(db, 'users', senderId), {

                                                        crr_question: docSnap.id,

                                                    }, {merge: true});

                                                })();
                                            });

                                        }

                                    } else if (['c??u h???i c???a t??i', 'cau hoi cua toi', 'cauhoicuatoi'].includes(text.toLowerCase())) {
                                        let link = 'https://lqdchatventure-web.herokuapp.com/quest?id=' + senderData.data().mask_id;
                                        let elements = [{
                                            'title': 'C??c c??u h???i b???n ???? ?????t',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'C??u h???i c???a b???n'
                                                }
                                            ]
                                        }];
                                        await sendList(senderId, elements);
                                    } else if (['c??u h???i ???? tr??? l???i', 'cau hoi ???? tr??? l???i', 'cauhoidatraloi', 'datraloi', '???? tr??? l???i', 'da tra loi'].includes(text.toLowerCase())) {
                                        let link = 'https://lqdchatventure-web.herokuapp.com/answered?id=' + senderData.data().mask_id;
                                        let elements = [{
                                            'title': 'C??c c??u h???i b???n ???? tr??? l???i',
                                            'default_action': {
                                                'type': 'web_url',
                                                'url': link,
                                                'webview_height_ratio': 'full',
                                            },
                                            'buttons': [
                                                {
                                                    'type': 'web_url',
                                                    'url': link,
                                                    'title': 'C??u h???i b???n ???? tr??? l???i'
                                                }
                                            ]
                                        }];
                                        await sendList(senderId, elements);
                                    } else if (['c??u h???i hi???n t???i', 'cau hoi hien tai', 'cauhoihientai'].includes(text.toLowerCase())) {
                                        if (senderData.data().crr_question === null || senderData.data().crr_question === undefined) {
                                            await sendQuickReplyQuestion(senderId, 'B???n ch??a t??m ki???m c??u h???i n??o c???');
                                        } else {
                                            let questData = await getDoc(doc(db, 'questions', senderData.data().crr_question))
                                            await sendTextMessage(senderId, "C??u h???i hi???n t???i : " + questData.data().text);
                                        }
                                    } else if (['block'].includes(text.toLowerCase())) {
                                        await blockFunc(senderId, senderData, senderData.data().partner);
                                    } else if (['b??o bug', 'b??o l???i', 'baobug', 'baoloi'].includes(text.toLowerCase())) {
                                        await setDoc(doc(db, "global_vars", "bug"), {
                                            bugger: arrayUnion(senderId),
                                        }, {merge: true})
                                    } else if (['resetacc', 'reset acc'].includes(text.toLowerCase())) {
                                        //Reset acc

                                        await getOut();

                                        let queryHistory = query(collection(db, 'users', senderId, 'history'));

                                        let querySnapshot = await getDocs(queryHistory);

                                        querySnapshot.forEach((gettedDoc) => {
                                            (async () => {
                                                await deleteDoc(doc(db, 'users', senderId, 'history', gettedDoc.id));
                                                await deleteDoc(doc(db, 'users', psid, 'history', gettedDoc.id));
                                            })();
                                        });

                                        await deleteDoc(doc(db, 'global_vars', 'masks', 'users', senderData.data().mask_id));

                                        let docRef = await addDoc(collection(db, 'global_vars', 'masks', 'users'), {
                                            id: senderId
                                        });

                                        await setDoc(doc(db, 'users', senderId), {
                                            nickname: '???n danh',
                                            gender: null,
                                            fb_link: null,
                                            history_requesting_timestamp: null,
                                            last_connect: null,
                                            id: senderId,
                                            topic: null,
                                            partner: null,
                                            crr_timestamp: null,
                                            age: null,
                                            age_range: null,
                                            tags: [],
                                            find_tags: [],
                                            find_gender: null,
                                            blocked: [],
                                            queued_timestamp: null,
                                            answered_questions: [],
                                            // asked_questions: [],
                                            listen_to_queue: true,
                                            exclude_last_connected: false,
                                            mask_id: docRef.id,
                                            qa_requesting_id: null,
                                        });

                                        await sendQuickReply(senderId, 'B???n ???? reset acc th??nh c??ng');

                                    } else if (checkIfParameterCmd(text)) {

                                        var command = text.substr(0, text.indexOf(' '));
                                        var parameter = text.substr(text.indexOf(' ') + 1);

                                        // console.log(command, parameter);

                                        if (command.toLowerCase() === '-admin-global' && (senderId === '4007404939324313' || senderId === '5654724101269283')) {
                                            let all = query(collection(db, 'users'));

                                            let querySnapshot = await getDocs(all);

                                            querySnapshot.forEach((gettedDoc) => {
                                                (async () => {
                                                    try {
                                                        await sendTextMessage(gettedDoc.id, parameter);
                                                    } catch (e) {
                                                        console.log("Err: " + e);
                                                    }
                                                })();
                                            });
                                            await sendTextMessage(senderId, "???? g???i tin nh???n global");
                                        } else if (command.toLowerCase() === 'fblink') {
                                            await setDoc(doc(db, 'users', senderId), {

                                                fb_link: parameter,

                                            }, {merge: true});
                                            await sendQuickReply(senderId, 'Link FB c???a b???n ???? ???????c c???p nh???t');
                                        } else if (command.toLowerCase() === 'nickname') {
                                            await setDoc(doc(db, 'users', senderId), {

                                                nickname: parameter,

                                            }, {merge: true});

                                            await sendQuickReply(senderId, 'Nickname c???a b???n ???? ???????c ?????t l?? ' + parameter);

                                            if (senderData.data().crr_timestamp !== null) {
                                                await setDoc(doc(db, 'users', senderData.data().partner,
                                                    'history', senderData.data().crr_timestamp.toString()), {

                                                    nickname: parameter,

                                                }, {merge: true});
                                            }

                                        } else if (command.toLowerCase() === 'gioitinh') {

                                            if (parameter !== 'nam' && parameter !== 'nu' && parameter !== 'khongdat') {
                                                await sendQuickReplyGender(senderId, 'Gi???i t??nh kh??ng h???p l???. C??c gi???i t??nh c?? th???' +
                                                    ' ?????t : nam | nu | khongdat');
                                                return;
                                            }

                                            let set_gender;
                                            if (parameter === 'nam') set_gender = 'male';
                                            else if (parameter === 'nu') set_gender = 'female';
                                            else set_gender = null;

                                            await setDoc(doc(db, 'users', senderId), {

                                                gender: set_gender,
                                                setup_gender: true

                                            }, {merge: true});

                                            await sendQuickReply(senderId, 'Gi???i t??nh c???a b???n ???? ???????c ?????t l?? : ' + parameter);

                                        } else if (command.toLowerCase() === 'datnickname') {

                                            if (senderData.data().crr_timestamp === null) {
                                                await sendQuickReply(senderId, 'B???n ch??a k???t n???i v???i ai');
                                            } else {
                                                await setDoc(doc(db, 'users', senderId,
                                                    'history', senderData.data().crr_timestamp.toString()), {

                                                    set_nickname: parameter,

                                                }, {merge: true});

                                                await sendTextMessage(senderId, 'B???n ???? ?????t nickname cho ?????i t?????ng l?? ' + parameter);
                                            }
                                        } else if (command.toLowerCase() === 'cauhoi' || command.toLowerCase() === 'ask') {

                                            // // console.log('Help');

                                            let docSnap = await getDoc(doc(db, 'global_vars', 'qa'));

                                            // // console.log('Quests count : ', docSnap.data().questions_count)

                                            await addDoc(collection(db, 'questions'), {

                                                text: parameter,
                                                answers_count: 0,
                                                timestamp: Date.now(),
                                                author: senderData.data().nickname,
                                                author_id: senderId,
                                                random_id: docSnap.data().questions_count

                                            });

                                            // // console.log('Hye');

                                            await setDoc(doc(db, 'global_vars', 'qa'), {

                                                questions_count: docSnap.data().questions_count + 1,

                                            }, {merge: true});

                                            await sendQuickReplyQuestion(senderId, "C??u h???i c???a b???n ???? ???????c ghi l???i");

                                        } else if (command.toLowerCase() === '-admin-system-quest' && senderId === '4007404939324313') {

                                            // // console.log('Help');

                                            let docSnap = await getDoc(doc(db, 'global_vars', 'qa'));

                                            // // console.log('Quests count : ', docSnap.data().questions_count)

                                            await addDoc(collection(db, 'questions'), {

                                                text: parameter,
                                                answers_count: 0,
                                                timestamp: Date.now(),
                                                author: 'SYSTEM',
                                                author_id: 'SYSTEM',
                                                random_id: docSnap.data().questions_count

                                            });

                                            // // console.log('Hye');

                                            await setDoc(doc(db, 'global_vars', 'qa'), {

                                                questions_count: docSnap.data().questions_count + 1,

                                            }, {merge: true});

                                            await sendTextMessage(senderId, "C??u h???i h??? th???ng ???? ???????c ghi l???i");

                                        } else if (command.toLowerCase() === 'traloi') {
                                            if (senderData.data().crr_question === null) {
                                                await sendQuickReplyQuestion(senderId, 'B???n ch??a t??m ki???m c??u h???i n??o c???');
                                            } else {
                                                let docSnapQuestions = await getDoc(doc(db, 'questions', senderData.data().crr_question));

                                                await addDoc(collection(db, 'questions', senderData.data().crr_question, 'answers'), {
                                                    text: parameter,
                                                    timestamp: Date.now(),
                                                    author: senderData.data().nickname,
                                                    author_id: senderId,
                                                });

                                                await setDoc(doc(db, 'questions', senderData.data().crr_question), {
                                                    answers_count: docSnapQuestions.data().answers_count + 1,
                                                }, {merge: true});

                                                await setDoc(doc(db, 'users', senderId), {
                                                    answered_questions: arrayUnion(docSnapQuestions.data().random_id),
                                                    crr_question: null,
                                                }, {merge: true});

                                                let link = 'https://lqdchatventure-web.herokuapp.com/ans?questId=' + docSnapQuestions.id +
                                                    '&id=' + senderData.data().mask_id;

                                                let elements = [{
                                                    'title': 'C??u h???i c???a b???n ???? ???????c ghi l???i',
                                                    'default_action': {
                                                        'type': 'web_url',
                                                        'url': link,
                                                        'webview_height_ratio': 'full',
                                                    },
                                                    'buttons': [
                                                        {
                                                            'type': 'web_url',
                                                            'url': link,
                                                            'title': 'C??c c??u tr??? l???i kh??c'
                                                        }
                                                    ]
                                                }];
                                                await sendList(senderId, elements);
                                            }
                                        } else if (command.toLowerCase() === 'phongdoi') {

                                            if (parameter === 'khong') {
                                                await setDoc(doc(db, 'users', senderId), {
                                                    listen_to_queue: false
                                                }, {merge: true});
                                                await sendQuickReplyQueue(senderId, 'B???n ???? tho??t kh???i ph??ng ?????i. ' +
                                                    '????? ti???p t???c tham gia ph??ng ?????i h??y nh???p \'phongdoi co\'', false
                                                )

                                            } else if (parameter === 'co') {
                                                await setDoc(doc(db, 'users', senderId), {
                                                    listen_to_queue: true
                                                }, {merge: true});
                                                await sendQuickReplyQueue(senderId, 'B???n ???? tham gia ph??ng ?????i. ' +
                                                    '????? tho??t kh???i ph??ng ?????i h??y nh???p \'phongdoi khong\'', true
                                                )
                                            }
                                        }
                                    } else {
                                        //Tin nh???n th?????ng

                                        if (senderData.data().crr_game_room !== null && senderData.data().crr_game_room !== undefined) {
                                            let snapshotRef = collection(db, 'game_rooms', senderData.data().crr_game_room,
                                                'players');

                                            let players = await getDocs(snapshotRef);

                                            let game_nickname = senderData.data().game_nickname;

                                            players.forEach((player) => {
                                                (async () => {
                                                    try {
                                                        await sendTextMessage(player.data().id, game_nickname + " :\n\n" + text);
                                                    } catch (e) {
                                                        console.log("Error at game message:", e);
                                                    }

                                                })();
                                            });
                                        } else if (senderData.data().crr_timestamp !== null) {
                                            command_text = false;
                                            await sendTextMessage(senderData.data().partner, text);

                                        } else if (senderData.data().listen_to_queue === true &&
                                            (senderData.data().queued_timestamp !== null
                                                || senderData.data().history_requesting_timestamp !== null
                                                || senderData.data().qa_requesting_id !== null)) {

                                            command_text = false;

                                            await sendQueueTextMessage(senderId, text);

                                        } else {
                                            await sendQuickReply(senderId, 'C??u l???nh kh??ng h???p l???. B???n ch??a k???t n???i v???i ai c???');
                                        }

                                    }
                                } else {
                                    //Attachments

                                    if (senderData.data().crr_timestamp === null
                                        && senderData.data().history_requesting_timestamp === null
                                        && senderData.data().queued_timestamp === null
                                        && senderData.data().qa_requesting_id === null) {

                                        await sendQuickReply(senderId, 'B???n ??ang kh??ng k???t n???i v???i ai c???');

                                    } else {

                                        for (var attachments of message.message.attachments) {
                                            var type = attachments.type;
                                            var payload = attachments.payload.url;

                                            if (senderData.data().crr_timestamp !== null) {
                                                command_text = false;

                                                if (type === 'image') {
                                                    await bot.sendImageMessage(senderData.data().partner, payload)
                                                } else if (type === 'audio') {
                                                    await bot.sendAudioMessage(senderData.data().partner, payload)
                                                } else if (type === 'video') {
                                                    await bot.sendVideoMessage(senderData.data().partner, payload)
                                                } else if (type === 'file') {
                                                    await bot.sendFileMessage(senderData.data().partner, payload)
                                                }
                                            } else if (senderData.data().listen_to_queue === true &&
                                                (senderData.data().queued_timestamp !== null
                                                    || senderData.data().history_requesting_timestamp !== null
                                                    || senderData.data().qa_requesting_id !== null)) {

                                                command_text = false;

                                                let docRef = doc(db, 'global_vars', 'queue');
                                                let docSnap = await getDoc(docRef);

                                                for (let queued_user_index in docSnap.data().queue_list) {
                                                    let queued_user = docSnap.data().queue_list[queued_user_index];

                                                    let docRefQueueUser = doc(db, 'users', queued_user);
                                                    let docSnapQueueUser = await getDoc(docRefQueueUser);

                                                    if (docSnapQueueUser.data().listen_to_queue === true
                                                        && queued_user !== senderId) {

                                                        if (type === 'image') {
                                                            await sendTextMessage(queued_user, senderData.data().nickname + " ???? g???i 1 ???nh");
                                                            await bot.sendImageMessage(queued_user, payload);
                                                        } else if (type === 'audio') {
                                                            await sendTextMessage(queued_user, senderData.data().nickname + " ???? g???i 1 ??o???n ??m thanh");
                                                            await bot.sendAudioMessage(queued_user, payload);
                                                        } else if (type === 'video') {
                                                            await sendTextMessage(queued_user, senderData.data().nickname + " ???? g???i 1 video");
                                                            await bot.sendVideoMessage(queued_user, payload);
                                                        } else if (type === 'file') {
                                                            await sendTextMessage(queued_user, senderData.data().nickname + " ???? g???i 1 file");
                                                            await bot.sendFileMessage(queued_user, payload);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (command_text) await sendQuickReply(senderId);
                            } else if (message.postback) {

                                //Payload
                                let payload = message.postback.payload.split(' ');
                                var timestamp = parseInt(payload[1]);
                                var psid = payload[2];

                                //Payload y??u c???u k???t n???i
                                if (payload[0] === 'CONNECT_REQUEST_PAYLOAD') {
                                    //Check n???u ??ang trong h??ng ?????i ho???c ???? k???t n???i
                                    if (senderData.data().crr_timestamp !== null
                                        || senderData.data().queued_timestamp !== null
                                        || senderData.data().history_requesting_timestamp !== null
                                        || senderData.data().qa_requesting_id !== null) {
                                        await sendTextMessage(senderId, 'B???n ph???i kh??ng ??ang y??u c???u ho???c k???t n???i v???i ai. H??y nh???p l???nh tho??t tr?????c khi ' +
                                            'g???i y??u c???u k???t n???i');
                                    } else {

                                        //Check n???u ng?????i kia c??ng ??ang y??u c???u connect
                                        let docRef = doc(db, 'users', psid, 'history', timestamp.toString());
                                        let docSnap = await getDoc(docRef);

                                        if (!docSnap.exists()) {
                                            await sendTextMessage(senderId, 'L???ch s??? cu???c tr?? chuy???n n??y ???? b??? x??a b???i b???n ' +
                                                'ho???c ?????i t??c');
                                            return;
                                        }

                                        if (docSnap.data().requested === true) {
                                            await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {

                                                requesting: false,

                                            }, {merge: true});

                                            await setDoc(doc(db, 'users', psid, 'history', timestamp.toString()), {

                                                requested: false

                                            }, {merge: true});

                                            await connect(senderId, psid);
                                        } else {
                                            //S???a request, v??o h??ng ?????i
                                            await setDoc(doc(db, 'users', senderId), {

                                                history_requesting_timestamp: timestamp,
                                                history_requesting_id: psid,
                                                queued_timestamp: Date.now()

                                            }, {merge: true});

                                            await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {

                                                requested: true

                                            }, {merge: true});

                                            await setDoc(doc(db, 'global_vars', 'queue'), {

                                                queue_list: arrayUnion(senderId)

                                            }, {merge: true});

                                            await sendQueueTextMessage(senderId, senderData.data().nickname + ' ???? tham gia ph??ng ?????i');

                                            await sendTextMessage(senderId, '???? g???i y??u c???u k???t n???i cho ' +
                                                'ng?????i d??ng l??c ' + timeConverter(timestamp));

                                            await setDoc(doc(db, 'users', psid, 'history', timestamp.toString()), {

                                                requesting: true,

                                            }, {merge: true});

                                            await sendTextMessage(psid, 'Ng?????i d??ng l??c ' + timeConverter(timestamp)
                                                + ' ???? g???i y??u c???u k???t n???i');

                                            let docRef = doc(db, 'users', psid, 'history', timestamp.toString());
                                            let docSnap = await getDoc(docRef);

                                            let title;

                                            title = docSnap.data().nickname === null
                                                ? 'Ng?????i l???' : docSnap.data().nickname;
                                            if (docSnap.data().set_nickname !== null) title += ' ( ' + docSnap.data().set_nickname + ' )';

                                            let command_elements = [
                                                {
                                                    'title': title,
                                                    'subtitle': timeConverter(docSnap.data().timestamp),
                                                    'default_action': {
                                                        'type': 'web_url',
                                                        'url': docSnap.data().fb_link !== null ? docSnap.data().fb_link
                                                            : 'https://www.facebook.com/',
                                                        'webview_height_ratio': 'full',
                                                    },
                                                    'buttons': [
                                                        {
                                                            'type': 'postback',
                                                            'title': '?????ng ?? k???t n???i',
                                                            'payload': 'ACCEPT_REQUEST_PAYLOAD ' + timestamp + ' ' + senderId
                                                        },
                                                        {
                                                            'type': 'postback',
                                                            'title': 'T??? ch???i y??u c???u',
                                                            'payload': 'REJECT_REQUEST_PAYLOAD ' + timestamp + ' ' + senderId
                                                        }
                                                    ]
                                                }
                                            ];


                                            let remove_elements = [
                                                {
                                                    'title': title,
                                                    'subtitle': timeConverter(docSnap.data().timestamp),
                                                    'default_action': {
                                                        'type': 'web_url',
                                                        'url': docSnap.data().fb_link !== null ? docSnap.data().fb_link
                                                            : 'https://www.facebook.com/',
                                                        'webview_height_ratio': 'full',
                                                    },
                                                    'buttons': [
                                                        {
                                                            'type': 'postback',
                                                            'title': 'X??a cu???c tr?? chuy???n',
                                                            'payload': 'DELETE_HISTORY_PAYLOAD ' + timestamp + ' ' + senderId
                                                        },
                                                        {
                                                            'type': 'postback',
                                                            'title': 'Block',
                                                            'payload': 'BLOCK_PAYLOAD ' + timestamp + ' ' + senderId
                                                        }
                                                    ]
                                                }
                                            ];

                                            await sendList(psid, command_elements);
                                            await sendList(psid, remove_elements);
                                        }
                                    }
                                }
                                //Payload ?????ng ?? request
                                else if (payload[0] === 'ACCEPT_REQUEST_PAYLOAD') {

                                    //Check n???u trong h??ng ?????i ho???c ???? k???t n???i
                                    if (senderData.data().crr_timestamp !== null) {
                                        await sendTextMessage(senderId, ' B???n ph???i kh??ng trong h??ng ?????i / y??u c???u ' +
                                            'k???t n???i t???i ng?????i kh??c. H??y \'thoat\' tr?????c khi ?????ng ?? k???t n???i');
                                    } else {
                                        //Check n???u y??u c???u c??n hi???u l???c

                                        let docRef = doc(db, 'users', psid, 'history', timestamp.toString());
                                        let docSnap = await getDoc(docRef);
                                        if (docSnap.data().requested === true) {

                                            await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {

                                                requesting: false,

                                            }, {merge: true});

                                            await setDoc(doc(db, 'users', psid, 'history', timestamp.toString()), {

                                                requested: false

                                            }, {merge: true});

                                            await connect(senderId, psid);
                                        } else {

                                            //L???i m???i kh??ng c??n hi???u l???c khi timestamp c???a ng?????i m???i ???? h???y requested
                                            await sendTextMessage(senderId, 'Ng?????i d??ng hi???n kh??ng c??n y??u c???u k???t n???i t???i b???n');
                                        }
                                    }
                                }
                                //Payload x??a y??u c???u
                                else if (payload[0] === 'REMOVE_REQUEST_PAYLOAD') {

                                    let docRef = doc(db, 'users', senderId, 'history', timestamp.toString());
                                    let docSnap = await getDoc(docRef);
                                    //N???u y??u c???u ???? b??? x??a (Ng?????i kia t??? ch???i ho???c m??nh exit ho???c ???? remove)
                                    if (!docSnap.exists() || docSnap.data().requested === false) {
                                        await sendTextMessage(senderId, 'B???n ???? kh??ng c??n y??u c???u k???t n???i v???i ng?????i d??ng n??y ' +
                                            'ho???c ng?????i y??u c???u ???? h???y l???i m???i');
                                    } else {

                                        //X??a queued v?? history_requesting_timestamp
                                        await setDoc(doc(db, 'users', senderId), {

                                            history_requesting_timestamp: null,
                                            history_requesting_id: null,
                                            queued_timestamp: null

                                        }, {merge: true});

                                        //X??a requested c???a timestamp
                                        await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {

                                            requested: false,

                                        }, {merge: true});

                                        //X??a queue
                                        await setDoc(doc(db, 'global_vars', 'queue'), {

                                            queue_list: arrayRemove(senderId)

                                        }, {merge: true});

                                        await sendQueueTextMessage(senderId, senderData.data().nickname + ' ???? tho??t kh???i ph??ng ?????i');

                                        //X??a requesting b??n kia timestamp
                                        await setDoc(doc(db, 'users', psid, 'history', timestamp.toString()), {

                                            requesting: false

                                        }, {merge: true});

                                        await sendTextMessage(senderId, 'B???n ???? h???y y??u c???u k???t n???i');
                                    }

                                }
                                //Payload t??? ch???i y??u c???u
                                else if (payload[0] === 'REJECT_REQUEST_PAYLOAD') {

                                    //Check y??u c???u c??n hi???u l???c
                                    let docRef = doc(db, 'users', psid, 'history', timestamp.toString());
                                    let docSnap = await getDoc(docRef);

                                    //N???u y??u c???u h???t hi???u l???c v?? ???? b??? rejected, ng?????i kia remove ho???c exit
                                    if (docSnap.data().requested === false) {
                                        await sendTextMessage(senderId, 'B???n ???? kh??ng c??n y??u c???u k???t n???i v???i ng?????i d??ng n??y ' +
                                            'ho???c ng?????i y??u c???u ???? h???y l???i m???i');
                                    } else {

                                        //Remove requesting b??n timestamp m??nh
                                        await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {

                                            requesting: false,

                                        }, {merge: true});

                                        //Remove requested b??n timestamp h???
                                        await setDoc(doc(db, 'users', psid, 'history', timestamp.toString()), {

                                            requested: false

                                        }, {merge: true});

                                        //Remove history_requesting_timestamp c???a h???
                                        await setDoc(doc(db, 'users', psid), {

                                            history_requesting_timestamp: null,
                                            history_requesting_id: null,
                                            queued_timestamp: null

                                        }, {merge: true});

                                        //X??a queue
                                        await setDoc(doc(db, 'global_vars', 'queue'), {

                                            queue_list: arrayRemove(psid)

                                        }, {merge: true});

                                        let docSnapNickname = await getDoc(doc(db, 'users', psid));
                                        await sendQueueTextMessage(psid, docSnapNickname.data().nickname + ' ???? tho??t kh???i ph??ng ?????i');

                                        await sendTextMessage(senderId, 'B???n ???? t??? ch???i c???u k???t n???i');
                                        await sendTextMessage(psid, 'Ng?????i d??ng v??o l??c ' + timeConverter(timestamp)
                                            + ' ???? t??? ch???i y??u c???u k???t n???i c???a b???n');
                                    }

                                }
                                //Payload y??u c???u trao ?????i in4
                                else if (payload[0] === 'POST_INFO_PAYLOAD') {

                                    if (senderData.data().crr_timestamp === timestamp) {

                                        if (senderData.data().fb_link === null) {
                                            await sendTextMessage(senderId, 'B???n ch??a thi???t l???p t??i kho???n FB')
                                        } else {
                                            await setDoc(doc(db, 'users', psid,
                                                'history', senderData.data().crr_timestamp.toString()), {
                                                fb_link: senderData.data().fb_link
                                            }, {merge: true});

                                            await sendTextMessage(senderId, '???? g???i');
                                            await sendTextMessage(psid, '???? nh???n ' + senderData.data().fb_link);
                                        }
                                    } else {
                                        await sendTextMessage(senderId, 'B???n kh??ng c??n k???t n???i v???i ng?????i n??y')
                                    }
                                } else if (payload[0] === 'DELETE_HISTORY_PAYLOAD') {
                                    let docRef = doc(db, 'users', psid, 'history', timestamp.toString());
                                    let docSnap = await getDoc(docRef);

                                    if (!docSnap.exists()) {
                                        await sendTextMessage(psid, 'L???ch s??? ???? b??? x??a t??? tr?????c')
                                    } else {
                                        let queryHistory = query(collection(db, 'users', senderId, 'history')
                                            , where('psid', '==', psid)
                                        )

                                        let querySnapshot = await getDocs(queryHistory);

                                        querySnapshot.forEach((gettedDoc) => {
                                            (async () => {
                                                await deleteDoc(doc(db, 'users', senderId, 'history', gettedDoc.id));
                                                await deleteDoc(doc(db, 'users', psid, 'history', gettedDoc.id));
                                            })();
                                        });

                                        //N???u ??ang k???t n???i
                                        if (senderData.data().partner === psid) {
                                            //H???y k???t n???i cho partner
                                            await setDoc(doc(db, 'users', psid), {
                                                partner: null,
                                                // nickname: null,
                                                queued_timestamp: null,
                                                history_requesting_timestamp: null,
                                                crr_timestamp: null
                                                // gender: profile.gender === undefined ? null : profile.gender,
                                                // token: Math.floor(Math.random() * 69420),
                                                // age: null,
                                            }, {merge: true});

                                            //Reset
                                            await setDoc(doc(db, 'users', senderId), {
                                                partner: null,
                                                // nickname: null,
                                                queued_timestamp: null,
                                                history_requesting_timestamp: null,
                                                crr_timestamp: null
                                                // gender: profile.gender === undefined ? null : profile.gender,
                                                // token: Math.floor(Math.random() * 69420),
                                                // age: null,
                                            }, {merge: true});

                                            await sendTextMessage(psid, 'B???n ???? b??? x??a l???ch s??? v???i ng?????i n??y th??nh c??ng');
                                        }
                                        await sendTextMessage(senderId, 'B???n ???? x??a l???ch s???s v???i ng?????i n??y th??nh c??ng');
                                    }
                                } else if (payload[0] === 'BLOCK_PAYLOAD') {
                                    await blockFunc(senderId, senderData, psid);
                                } else {
                                    let psid = payload[1];

                                    if (payload[0] === 'QA_ACCEPT_REQUEST_PAYLOAD') {

                                        //Check n???u trong h??ng ?????i ho???c ???? k???t n???i
                                        if (senderData.data().crr_timestamp !== null) {
                                            await sendTextMessage(senderId, ' B???n ph???i kh??ng trong h??ng ?????i / y??u c???u ' +
                                                'k???t n???i t???i ng?????i kh??c. H??y \'thoat\' tr?????c khi ?????ng ?? k???t n???i');
                                        } else {
                                            //Check n???u y??u c???u c??n hi???u l???c

                                            let docRef = doc(db, 'users', psid);
                                            let docSnap = await getDoc(docRef);
                                            if (docSnap.data().qa_requesting_id === senderId) {
                                                await connect(senderId, psid);
                                            } else {
                                                //L???i m???i kh??ng c??n hi???u l???c khi timestamp c???a ng?????i m???i ???? h???y requested
                                                await sendTextMessage(senderId, 'Ng?????i d??ng hi???n kh??ng c??n y??u c???u k???t n???i t???i b???n');
                                            }
                                        }
                                    } else if (payload[0] === 'QA_REJECT_REQUEST_PAYLOAD') {
                                        let docRef = doc(db, 'users', psid);
                                        let docSnap = await getDoc(docRef);
                                        if (docSnap.data().qa_requesting_id === senderId) {
                                            await setDoc(doc(db, 'users', psid), {
                                                qa_requesting_id: null,
                                            }, {merge: true});
                                            await sendTextMessage(psid, 'Rejected');
                                            await sendTextMessage(senderId, 'Y??u c???u k???t n???i c???a b???n ???? b??? t??? ch???i');

                                            await setDoc(doc(db, 'global_vars', 'queue'), {
                                                queue_list: arrayRemove(psid)
                                            }, {merge: true});

                                        } else {
                                            //L???i m???i kh??ng c??n hi???u l???c khi timestamp c???a ng?????i m???i ???? h???y requested
                                            await sendTextMessage(senderId, 'Ng?????i d??ng hi???n kh??ng c??n y??u c???u k???t n???i t???i b???n');
                                        }
                                    } else if (payload[0] === 'QA_REMOVE_REQUEST_PAYLOAD') {

                                        if (senderData.data().qa_requesting_id === psid) {
                                            await setDoc(doc(db, 'users', senderId), {
                                                qa_requesting_id: null,
                                                queued_timestamp: null
                                            }, {merge: true})

                                            await setDoc(doc(db, 'global_vars', 'queue'), {
                                                queue_list: arrayRemove(senderId)
                                            }, {merge: true});

                                        } else {
                                            //L???i m???i kh??ng c??n hi???u l???c khi timestamp c???a ng?????i m???i ???? h???y requested
                                            await sendTextMessage(senderId, 'B???n kh??ng c??n y??u c???u k???t n???i t???i ng?????i d??ng');
                                        }
                                    }
                                }
                            }
                            //Reaction
                            else if (message.reaction) {

                                let react = message.reaction;
                                if (react.action === 'react')
                                    await sendTextMessage(senderData.data().partner, '???? th??? react ' + react.emoji);
                                else
                                    await sendTextMessage(senderData.data().partner, '???? x??a react');

                                // if (senderData.data().crr_timestamp !== null) {
                                //     let react = message.reaction;
                                //     getTextbyMID(react.mid).then(function (message) {
                                //             var textMID = message
                                //
                                //             var reactMessage
                                //             if (react.action === 'react')
                                //                 reactMessage = '???? th??? ' + react.emoji + ' tin nh???n :\n\n' +
                                //                     textMID;
                                //             else
                                //                 reactMessage = '???? x??a react tin nh???n : \n\n' +
                                //                     textMID;
                                //
                                //             // console.log(senderData.data().partner, reactMessage);
                                //
                                //             (async () => {
                                //                 await sendTextMessage(senderData.data().partner, reactMessage);
                                //             })();
                                //
                                //         }
                                //     ).catch((err) => // console.log(err));
                                // }
                            }
                        }
                    }
                } catch
                    (e) {
                    console.log("BUG: ", e);
                }
            }
        )();
        res.status(200).send('OK');
    }
)

// Request t???i pipedream debug
function sendReq(rq) {
    request({
        url: 'https://en8p31fkk54ombz.m.pipedream.net/',
        method: 'POST',
        json: rq
    });
}

function getTextbyMID(mid) {
    // console.log(mid);
    return new Promise(function (resolve, reject) {
        request({
            url: 'https://graph.facebook.com/v12.0/' + mid + '?fields=message',
            qs: {
                access_token: FB_pageToken,
            },
            method: 'GET',
        }, function (err, res, body) {
            if (err) {
                // console.log(err);
                reject(err);
                return;
            }
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(body.message);
                // // console.log(body);
                // resolve(body);
            } catch (e) {
                reject(e);
            }
        });
    })
}

function getProfile(id) {
    return new Promise(function (resolve, reject) {
        request({
            url: 'https://graph.facebook.com/v12.0/' + id + '?fields=gender',
            qs: {
                access_token: FB_pageToken,
            },
            method: 'POST',
        }, function (err, res, body) {
            if (err) {
                // console.log(err);
                reject(err);
                return;
            }
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
                // // console.log(JSON.parse(body));
                // resolve(body);
            } catch (e) {
                reject(e);
            }
        });
    })
}

async function sendList(senderID, elements) {
    await request({
        url: 'https://graph.facebook.com/v12.0/me/messages',
        qs: {
            access_token: FB_pageToken,
        },
        method: 'POST',
        json: {
            'recipient': {
                'id': senderID
            },
            'message': {
                'attachment': {
                    'type': 'template',
                    'payload': {
                        'template_type': 'generic',
                        'elements': elements
                    }
                }
            }
        }
    });
}

function timeConverter(timestamp) {
    var a = new Date(timestamp);
    // var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // var year = a.getFullYear();
    // var month = months[a.getMonth()];
    // var date = a.getDate();
    // var hour = a.getHours();
    // var min = a.getMinutes();
    // var sec = a.getSeconds();
    // return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return a.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
}

async function connect(senderId, gettedId) {
    let timestamp = Date.now();

    await setDoc(doc(db, 'users', senderId), {
        partner: gettedId,
        history_requesting_timestamp: null,
        history_requesting_id: null,
        crr_timestamp: timestamp,
        last_connect: gettedId,
        queued_timestamp: null,
        find_gender: null,
        qa_requesting_id: null,
    }, {merge: true});

    let docRef = doc(db, 'users', gettedId);
    let docSnap = await getDoc(docRef);

    await setDoc(doc(db, 'users', senderId, 'history', timestamp.toString()), {
        timestamp: timestamp,
        psid: gettedId,
        tags: null,
        nickname: docSnap.data().nickname,
        set_nickname: null,
        fb_link: null,
        img: null,
        requested: false,
        requesting: false,
    }, {merge: true});

    await setDoc(doc(db, 'users', gettedId), {
        partner: senderId,
        history_requesting_timestamp: null,
        history_requesting_id: null,
        crr_timestamp: timestamp,
        last_connect: senderId,
        queued_timestamp: null,
        find_gender: null,
        qa_requesting_id: null,

    }, {merge: true});

    docRef = doc(db, 'users', senderId);
    docSnap = await getDoc(docRef);

    await setDoc(doc(db, 'users', gettedId, 'history', timestamp.toString()), {
        timestamp: timestamp,
        psid: senderId,
        tags: null,
        nickname: docSnap.data().nickname,
        set_nickname: null,
        fb_link: null,
        img: null,
        requested: false,
        requesting: false,
    }, {merge: true});

    //X??a queue
    await setDoc(doc(db, 'global_vars', 'queue'), {
        queue_list: arrayRemove(gettedId)
    }, {merge: true});

    await setDoc(doc(db, 'global_vars', 'queue'), {
        queue_list: arrayRemove(senderId)
    }, {merge: true});

    let docSnapNickname = await getDoc(doc(db, 'users', gettedId));

    await setDoc(doc(db, 'users', gettedId, 'notifications', timestamp.toString()), {
        text: 'B???n ???? ???????c k???t n???i',
        author: docSnap.data().nickname,
        timestamp: timestamp
    }, {merge: true});

    await setDoc(doc(db, 'users', senderId, 'notifications', timestamp.toString()), {
        text: 'B???n ???? ???????c k???t n???i',
        author: docSnapNickname.data().nickname,
        timestamp: timestamp
    }, {merge: true});

    await sendQueueTextMessage(gettedId, docSnapNickname.data().nickname + ' ???? ???????c k???t n???i v?? tho??t kh???i ph??ng ?????i');
    await sendTextMessage(senderId, 'B???n ???? ???????c k???t n???i. N??i l???i ch??o v???i ng?????i b???n m???i ??i n??o');
    await sendTextMessage(gettedId, 'B???n ???? ???????c k???t n???i. N??i l???i ch??o v???i ng?????i b???n m???i ??i n??o');

}

async function addToQueue(senderId, senderData, find_gender) {

    if (find_gender !== null)
        await setDoc(doc(db, 'users', senderId), {

            find_gender: find_gender,

        }, {merge: true});

    senderData = senderData.data();
    senderData.find_gender = find_gender;

    // Check n???u trong h??ng ?????i ho???c ???? k???t n???i
    if (senderData.queued_timestamp !== null || senderData.crr_timestamp !== null
        || senderData.history_requesting_timestamp !== null || senderData.qa_requesting_id !== null) {
        await sendTextMessage(senderId, 'B???n ph???i kh??ng k???t n???i ho???c ??ang y??u c???u / trong h??ng ?????i v???i ai');
        return;
    }

    //Query cho ng?????i ??ang trong queued
    var queryForQueued = query(collection(db, 'users')
        , where('queued_timestamp', '!=', null)
        , orderBy('queued_timestamp')
    )

    let querySnapshot = await getDocs(queryForQueued);
    let find = null;
    //N???u t???n t???i th?? k???t n???i

    for (var x in querySnapshot.docs) {
        let gettedDoc = querySnapshot.docs[x];
        let gettedDocData = gettedDoc.data();

        console.log('hey ' + gettedDocData.last_connect);

        if (gettedDocData.exclude_last_connected === true && gettedDocData.last_connect === senderId) continue;
        if (senderData.exclude_last_connected === true && senderData.last_connect === gettedDoc.id) continue;
        console.log('Not last connected');

        console.log('ayo ', gettedDocData.find_tags,
            gettedDocData.id, senderData.find_tags);

        if (senderData.find_tags.length !== 0) {
            console.log('true1', senderData.find_tags.length);
            if (!senderData.find_tags.some(
                tags => gettedDocData.tags.includes(tags))) continue;
        }

        console.log('aloha ' + senderData.find_tags);

        if (gettedDocData.find_tags.length !== 0) {
            console.log('true2', gettedDocData.find_tags.length);
            if (!gettedDocData.find_tags.some(
                tags => senderData.tags.includes(tags))) continue;
        }

        console.log('Tags match');

        console.log(gettedDocData.age_range, senderData.age_range);

        if (gettedDocData.age_range !== null) {
            if (senderData.age === null) continue;
            if (gettedDocData.age_range[0] > senderData.age
                || senderData.age > gettedDocData.age_range[1])
                continue;
        }

        if (senderData.age_range !== null) {
            if (gettedDocData.age === null) continue;
            if (senderData.age_range[0] > gettedDocData.age
                || gettedDocData.age > senderData.age_range[1])
                continue;

        }

        console.log('Age range match');

        if (senderData.find_gender !== null && senderData.find_gender !== gettedDocData.gender) continue;
        if (gettedDocData.find_gender !== null && gettedDocData.find_gender !== senderData.gender) continue;

        console.log('Gender match');
        console.log(senderData.find_gender, senderData.gender);
        console.log(gettedDocData.find_gender, gettedDocData.gender);

        if (senderData.blocked.includes(gettedDoc.id)) continue;
        if (gettedDocData.blocked.includes(senderId)) continue;

        console.log('Not blocked');

        find = gettedDoc.id;
        console.log('aloho', find);

        break;
    }

    //N???u queued kh??ng th???a m??n
    if (find === null) {
        await setDoc(doc(db, 'users', senderId), {
            queued_timestamp: Date.now()
        }, {merge: true});

        await setDoc(doc(db, 'global_vars', 'queue'), {
            queue_list: arrayUnion(senderId)
        }, {merge: true});

        let docSnapNickname = await getDoc(doc(db, 'users', senderId));
        await sendQueueTextMessage(senderId, docSnapNickname.data().nickname + ' ???? tham gia ph??ng ?????i');

        await sendTextMessage(senderId, '??ang ch??? k???t n???i. B???n ???? ???????c ????a v??o h??ng ch???');

    } else {
        await connect(senderId, find);
    }
}

function checkIfParameterCmd(text) {
    let command = text.substr(0, text.indexOf(' '));
    if (command.toLowerCase() === '') {
        // await sendTextMessage(senderId, "L???nh kh??ng h???p l???");
        return false;

    }
    return ['-admin-global', 'fblink', 'nickname', 'datnickname', 'cauhoi', 'traloi', 'phongdoi', 'ask', 'gioitinh', "-admin-system-quest"]
        .includes(command.toLowerCase());
}

async function sendQueueTextMessage(senderId, text) {
    let docRef = doc(db, 'global_vars', 'queue');
    let docSnap = await getDoc(docRef);

    docRef = doc(db, 'users', senderId);
    let senderData = await getDoc(docRef);
    let nickname = senderData.data().nickname;

    for (let queued_user_index in docSnap.data().queue_list) {
        let queued_user = docSnap.data().queue_list[queued_user_index];
        let docRefQueueUser = doc(db, 'users', queued_user);
        let docSnapQueueUser = await getDoc(docRefQueueUser);
        // // console.log(docSnap.data().queue_list, queued_user, docSnapQueueUser.data());
        if (docSnapQueueUser.data().listen_to_queue === true
            && queued_user !== senderId) {
            try {
                await sendTextMessage(queued_user, nickname + " :\n\n" + text);
            } catch (e) {
                console.log("Error at sendQueueTextMessage:", e);
            }
        }

    }
}

async function sendQuickReply(senderId, text) {
    try {
        await request({
            url: 'https://graph.facebook.com/v12.0/me/messages',
            qs: {
                access_token: FB_pageToken,
            },
            method: 'POST',
            json: {
                "recipient": {
                    "id": senderId,
                },
                "messaging_type": "RESPONSE",
                "message": {
                    "text": text,
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "T??m ki???m",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons-for-free.com/iconfiles/png/512/search-131964753234672616.png"
                        },
                        {
                            "content_type": "text",
                            "title": "T??m nam",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Male-icon.png"
                        }, {
                            "content_type": "text",
                            "title": "T??m n???",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Female-icon.png"
                        }, {
                            "content_type": "text",
                            "title": "L???nh",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://image.flaticon.com/icons/png/512/59/59130.png"
                        }, {
                            "content_type": "text",
                            "title": "H??? s??",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://cdn.iconscout.com/icon/free/png-256/profile-417-1163876.png"
                        }, {
                            "content_type": "text",
                            "title": "T??m ki???m n??ng cao",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://static.thenounproject.com/png/2161054-200.png"
                        }, {
                            "content_type": "text",
                            "title": "T??m c??u h???i",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icon-library.com/images/question-icon/question-icon-0.jpg"
                        }, {
                            "content_type": "text",
                            "title": "C??u h???i c???a t??i",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://i.imgur.com/YwjvVyv.png"
                        },
                    ]
                }
            }
        });
    } catch (e) {
        console.log("Error at sendQuickReply : ", e);
    }
}

async function sendQuickReplyGender(senderId, text) {
    await request({
        url: 'https://graph.facebook.com/v12.0/me/messages',
        qs: {
            access_token: FB_pageToken,
        },
        method: 'POST',
        json: {
            "recipient": {
                "id": senderId,
            },
            "messaging_type": "RESPONSE",
            "message": {
                "text": text,
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "gioitinh nam",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Male-icon.png"
                    },
                    {
                        "content_type": "text",
                        "title": "gioitinh nu",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Female-icon.png"
                    }, {
                        "content_type": "text",
                        "title": "gioitinh khongdat",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://i.imgur.com/BYunYX8.png"
                    }
                ]
            }
        }
    });
}


async function sendQuickReplyQuestion(senderId, text) {
    await request({
        url: 'https://graph.facebook.com/v12.0/me/messages',
        qs: {
            access_token: FB_pageToken,
        },
        method: 'POST',
        json: {
            "recipient": {
                "id": senderId,
            },
            "messaging_type": "RESPONSE",
            "message": {
                "text": text,
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "T??m c??u h???i",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://icon-library.com/images/question-icon/question-icon-0.jpg"
                    }, {
                        "content_type": "text",
                        "title": "C??u h???i hi???n t???i",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://i.pinimg.com/736x/15/8b/ed/158bed9819e4fccf7e18a5eeeaf79c6b.jpg"
                    }, {
                        "content_type": "text",
                        "title": "C??u h???i c???a t??i",
                        "payload": "RANDOM_PAYLOAD",
                        "image_url": "https://i.pinimg.com/736x/15/8b/ed/158bed9819e4fccf7e18a5eeeaf79c6b.jpg"
                    },
                ]
            }
        }
    });
}

async function sendQuickReplyQueue(senderId, text, queue) {
    let option;
    if (queue) option = 'phongdoi khong'
    else option = 'phongdoi co';
    await request({
        url: 'https://graph.facebook.com/v12.0/me/messages',
        qs: {
            access_token: FB_pageToken,
        },
        method: 'POST',
        json: {
            "recipient": {
                "id": senderId,
            },
            "messaging_type": "RESPONSE",
            "message": {
                "text": text,
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": option,
                        "payload": "RANDOM_PAYLOAD",
                    },
                ]
            }
        }
    });
}

async function blockFunc(senderId, senderData, psid) {
    if (psid === null) {
        await sendQuickReply(senderId, 'B???n ??ang kh??ng k???t n???i v???i ai c??? ????? block');
        return;
    }

    let blocked = senderData.data().blocked;
    if (blocked.includes(psid)) {
        await sendQuickReply(senderId, 'B???n ???? block ng?????i n??y s???n t??? tr?????c');
    } else {
        blocked.push(psid);
        await setDoc(doc(db, 'users', senderId), {
            blocked: blocked
        }, {merge: true});

        let queryHistory = query(collection(db, 'users', senderId, 'history')
            , where('psid', '==', psid)
        )

        let querySnapshot = await getDocs(queryHistory);

        querySnapshot.forEach((gettedDoc) => {
            (async () => {
                await deleteDoc(doc(db, 'users', senderId, 'history', gettedDoc.id));
                await deleteDoc(doc(db, 'users', psid, 'history', gettedDoc.id));
            })();
        });

        //N???u ??ang k???t n???i
        if (senderData.data().partner === psid) {
            //H???y k???t n???i cho partner
            await setDoc(doc(db, 'users', psid), {
                partner: null,
                // nickname: null,
                crr_timestamp: null
            }, {merge: true});

            //Reset
            await setDoc(doc(db, 'users', senderId), {
                partner: null,
                // nickname: null,
                crr_timestamp: null
            }, {merge: true});

            await sendQuickReply(psid, 'B???n ???? b??? block th??nh c??ng');
        }
        try {
            await sendQuickReply(senderId, 'B???n ???? block th??nh c??ng');
        } catch (e) {
            console.log("Error at blockFunc: ", e);
        }

    }
}

async function getOut(senderId, senderData) {
    try {

        //Check n???u ??ang trong h??ng ?????i ho???c ???? k???t n???i ho???c ??ang request
        if (senderData.data().queued_timestamp === null
            && senderData.data().crr_timestamp === null
            && senderData.data().history_requesting_timestamp === null
            && senderData.data().qa_requesting_id === null) {
            return 0;
        }

        //N???u ??ang k???t n???i
        if (senderData.data().crr_timestamp !== null) {
            await sendQuickReply(senderId, 'B???n ???? tho??t kh???i cu???c tr?? chuy???n v???i ?????i t??c');

            //H???y k???t n???i cho partner
            await setDoc(doc(db, 'users', senderData.data().partner), {
                partner: null,
                crr_timestamp: null,
                find_gender: null,
            }, {merge: true});

            await sendQuickReply(senderData.data().partner, 'Ng?????i kia ???? tho??t kh???i cu???c tr?? chuy???n');
        } else if (senderData.data().listen_to_queue) {

            let nickname = senderData.data().nickname;
            await sendQueueTextMessage(senderId, nickname + ' ???? tho??t kh???i h??ng ?????i');
            await sendQuickReply(senderId, 'B???n ???? tho??t kh???i cu???c tr?? chuy???n trong h??ng ?????i');

        }

        //N???u ??ang request
        if (senderData.data().history_requesting_timestamp !== null) {

            //H???y l???i m???i k???t n???i cho b???n th??n
            await setDoc(doc(db, 'users', senderId,
                'history', senderData.data().history_requesting_timestamp.toString()), {
                requested: false
            }, {merge: true});

            //Query l???y psid ng?????i ???????c request
            let docRef = doc(db, 'users', senderId
                , 'history', senderData.data().history_requesting_timestamp.toString());
            let docSnapHistory = await getDoc(docRef);

            //H???y l???i m???i cho ng?????i ???????c request
            await setDoc(doc(db, 'users', docSnapHistory.data().psid
                , 'history', docSnapHistory.id), {
                requesting: false
            }, {merge: true});
        }

        //Reset
        await setDoc(doc(db, 'users', senderId), {
            partner: null,
            // nickname: null,
            history_requesting_timestamp: null,
            history_requesting_id: null,
            crr_timestamp: null,
            find_gender: null,
            queued_timestamp: null,
            qa_requesting_id: null,
        }, {merge: true});

        //X??a queue
        await setDoc(doc(db, 'global_vars', 'queue'), {
            queue_list: arrayRemove(senderId)
        }, {merge: true});

        return 1;
    } catch (e) {
        // Deal with the fact the chain failed
        console.log('Exit error:', e);
        return -1;
    }
}

async function sendTextMessage(senderId, text) {
    try {
        // console.log(senderId);
        await bot.sendTextMessage(senderId, text);
    } catch (e) {
        console.log("Error bot.send: ", e);
    }
}