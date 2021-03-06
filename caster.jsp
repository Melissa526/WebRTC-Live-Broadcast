<%@ taglib prefix="c" uri="">
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>D.Live OnAir</title>
    <link rel="stylesheet" href="./css/broadcast.css">
    <!-- 합쳐지고 최소화된 최신 CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    <!-- 부가적인 테마 -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
    
</head>
<body>
    <!-- header -->
    <!-- <%@include file="../header.jsp"%> -->

    <!-- content body -->
    <div class="container">
        <div class="row">
            <div class="col-lg-6" style="position: relative;">
                <div class="channel-description form-inline">
                    <div id="channel-icon"></div>
                    <div id="channel-name-area"><a id="channel-name" href="#">Channel Name</a></div>
                    <div id="channel-follow">
                        <span><i class="fal fa-star"></i></span>
                        <!-- Status in following:  <i class="fas fa-star"></i> -->
                        <span>팔로우</span></div>
                </div>
            </div>
        </div>
        <!-- Channel Logo's Title -->


        <!-- Control Box -->
        <!-- # If Role of user is 'ADMIN' or 'Artist', SHOW THIS -->
        <!-- DON'T SHOW for user in 'user' -->
        <div class="channel-controlbox">
                <button id="startButton">START</button>
                <!-- <button id="recButton">REC</button> -->
                <button id="stopButton">STOP</button>
        </div>

        <c:




        <div class="form-inline">
            <!-- live-booth -->
            <div class="live-booth">
                <!-- Video  -->
                <div class="channel-video-area">
                    <video id="video" autoplay controls></video>
                </div> 
                <!-- Live Stream Title -->
                <div class="channel-onair-info">
                    <div id="info-title">
                        <span id="onair-title">Live Stream Title on this</>
                    </div>
                    <!-- Number of visitors -->
                    <div id="info-numOf-visitor">
                        <span><h4>526</h4></span>
                        <span>명 접속중</span>
                    </div>
                    
                </div>
            </div>
            <!-- Chatroom -->
            <div class="pull-right chatbox">
                <div class="chatroom-top">
                    <h4>채팅</h4>
                    <h5>실시간 채팅</h5>    
                </div>
                <div class="chatroom">
                        <div id="msgDiv">
                            <ul id="messages"></ul>
                        </div>
                </div>
                <div class="chatroom-form">
                    <form action="">
                        <input type="text" id="msg" autocomplete="off" onKeyDown="onChatSubmit()">
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- footer -->
    <!-- <%@include file="../footer.jsp"%> -->

    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="./js/caster.js"></script>
    <!-- 합쳐지고 최소화된 최신 자바스크립트 -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
</body>
</html>