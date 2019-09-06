'use strict'    

if (document.title == 'TagPlate'){
    window.onload = TagPlate
}else{
    window.onload = Login
};


// ページタイトル「TagPlate」用のスクリプト
function TagPlate(){

    //************************************************************************* */
    //　タブ制御　プレート登録関連　
    //************************************************************************* */
    let toolbar = $('#toolbar');
    let tabcontent = $('#toolbar .tabcontents');
    let leftsidenaviwrapper = $('#leftsidenavi-wrapper a');
    
    //タブの処理
    tabcontent.eq(0).show(); //読み込み時、「すべてのプレート」タブを表示するため
    toolbar.addClass('selected');

    //タブのツールチップ表示
    leftsidenaviwrapper.tooltip({
        show: 'slideDown',
        position: {
            my:'left top',   //tooltipの位置
            at:'left bottom',//基準位置
            collision: 'none'
        },
        hide: false,
        tooltipClass: "ui-tooltiptab"//tooltipのスタイル設定クラス
    });

    leftsidenaviwrapper.on('click',function(){
        leftsidenaviwrapper.removeClass('active');
        $(this).addClass('active');//activeクラスの付け替え
        
        let index = leftsidenaviwrapper.index(this);//選択されたタブの特定
        tabcontent.hide();               //一旦すべて非表示に
        tabcontent.eq(index).show();     //選択タブの内容を表示
        
        //タブの表示に関わる処理
        toolbar.removeClass('selected').delay(0).queue(function(){
            toolbar.addClass('selected').dequeue(); //dequue()がないと処理が実行されない
        });
    })

    //プレート登録時のアニメーション用（連続登録されることも考慮して300msくらいで）
    //テキストが空欄で登録された時用の処理も欲しいね
    $('input[type=submit]').on('click',function(e){
        toolbar.effect('transfer',{to:$('#aAllPlates')},300,function(){
            $('#aAllPlates').effect('highlight',{color: 'rgb(80, 210, 210)'},300);
        });
    }) 
        
    //プレート登録後　登録したプレートをＤＯＭ追加
    $(document).on('ajax:success', 'form', function(e){
        $('#content-wrapper').prepend(
        '<div class="content-detail whitebkcol03"' +
        ' data-create='     + e.detail[0][0].created_at +
        ' data-groupname='  + e.detail[0][1] + 
        ' data-update='     + e.detail[0][0].updated_at +
        ' title="右方向へドラッグ＆ドロップ">'+
            '<div class="front fsize13" draggable="true">'+ e.detail[0][0].text     +'</div>'+
            '<nav class="updateddate">'+ e.detail[0][0].updated_at  +'</nav>'+
            '<nav class="groupname">'  + e.detail[0][1]    +'</nav>'+
        '</div>');
        const Addeddiv = $('#content-wrapper div:first');
        Addeddiv[0].addEventListener('dragstart',platedragstarat,false);
    })

    //
    $('#plate_group_id').select2({
        width: '95%',
    });

    //************************************************************************* */
    //　プレート・テキスト・画像　イベント制御、キャンバスのイベント制御　
    //************************************************************************* */
    let plates = document.getElementsByClassName('content-detail');
    let texts  = document.getElementsByClassName('texts');
    let images = document.getElementsByClassName('imageshape');
    
    let data    ='';    //プレート判定に使用、情報の保持
    let textdata='';    //テキスト判定に使用
    let image   ='';    //画像判定に使用
    let divlayerX;      //Ｘ座標の保持
    let divlayerY;      //Ｙ座標の保持

    //プレート***************************************************************************
    for ( let i = 0 ; i < plates.length ; i++ ){
        plates[i].addEventListener('dragstart',platedragstarat,false);
    }    
    function platedragstarat(e){
        image   = '';
        textdata= '';
        data = event.target.parentElement;
        divlayerX = event.layerX;
        divlayerY = event.layerY;
    }

    //テキスト++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for ( let i = 0 ; i < texts.length ; i++ ){
        texts[i].addEventListener('dragstart',textdragstarat,false);
    }   
    function textdragstarat(e){
        data = '';
        image= '';
        textdata = event.target;
        divlayerX = event.offsetX;
        divlayerY = event.offsetY;
    }

    //画像++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for ( let i = 0 ; i < images.length ; i++ ){
        images[i].addEventListener('dragstart',imagedragstarat,false);
    }   

    function imagedragstarat(e){
        data    = '';
        textdata= '';
        image = event.target;
        divlayerX = event.offsetX;
        divlayerY = event.offsetY;
    }

    let state;
    let undo = [];
    let redo = [];

    //キャンバス生成！！　
    let canvas = new fabric.Canvas('thecanvas',{backgroundColor:'white'});

    window.addEventListener('resize',canvas_resize,false);
    
    //常にキャンバスを縦横100％表示にしたい
    function canvas_resize(e){
        let w = $('.canvas-container')[0].clientWidth;
        let h = $('.canvas-container')[0].clientHeight;
        canvas.setDimensions({width: w, height: h});
        // canvas.renderAll();

    }
    canvas_resize();
    //jsonで保存時に必要最低限の情報のみを提供（データ削減のため）
    canvas.includeDefaultValues = false;

    //キャンバス内で何かしらの変化があった
    canvas.on('object:modified', function(e) {
        save();
    });

    //Undo・Redo処理*******************************************************************************
    function save() {
        redo = [];
        if (state) {
            undo.push(state);
        }
        //Jsonとして保持します
        state = JSON.stringify(canvas);
    }
    //保持していたJson情報をキャンバスへ表示
    function replay(playStack, saveStack) {
        saveStack.push(state);
        state = playStack.pop();
        canvas.clear();
        canvas.loadFromJSON(state, function() {
            canvas.renderAll();
        });
    }

    $('#redo-canvas').click(function() {
        if(undo.length != 0){
            replay(undo, redo, '#redo', this);
        }
    });
    $('#undo-canvas').click(function() {
        if(redo.length != 0){
            replay(redo, undo, '#redo', this);
        }
    });

    //表示処理（ログイン直後＆リロード時）************************************************************
    let canvasjson = $('#canvasjson').data('canvasjson'); //とりあえず←にJSON読み込んであるので
    canvas.loadFromJSON(canvasjson, function() {
        canvas.renderAll(); 
        save();
    })

    //保存処理*************************************************************************************
    $('#save-canvas').on('click',function(){
        savecanvas();
    });

    function savecanvas(){
        let data = canvas.toJSON(['id'])
        
        $.ajax({
            type       : "post",                     
            url        : "/ajax",                     
            data       : JSON.stringify(data),       
            contentType: 'application/json', 
            dataType   : "json",    
        }).done(function(){
            alert('保存完了')
        })
    }

    //整列ボタン表示処理****************************************************************************
    let alignmenu = $('#alignmenu')[0];
    $('#align-elements').on('click',function(e){
        let elmtarget = e.originalEvent.target;
        if (alignmenu.style.display == 'none'){
            if (e.originalEvent.target.id == 'align-elements'){
                alignmenu.style.left = elmtarget.offsetLeft + 'px'
            }else{
                alignmenu.style.left = elmtarget.parentElement.offsetLeft + 'px';
            }
            alignmenu.style.display = 'inline';
        }else{
            alignmenu.style.display = 'none';
        }
    })

    canvas.on('mouse:down', function(e) {
        if (alignmenu.style.display == 'inline'){
            alignmenu.style.display = 'none';
        };
    });

    //整列処理*************************************************************************************
    $('#left').on('click',setAlign);
    $('#right').on('click',setAlign);
    $('#top').on('click',setAlign);
    $('#bottom').on('click',setAlign);
    $('#center').on('click',setAlign);
    
    function setAlign(e) {
        
        let selectobj = canvas.getActiveObject();
        if (!selectobj){
            alignmenu.style.display = 'none';
        }else{
    
            let align = e.target.id;       
            let top = canvas.getActiveObject().height / 2;　//このラインがtopの基準っぽい
            let left = canvas.getActiveObject().width / 2;　//このラインがleftの基準っぽい
    
            switch (align) {
            case 'top':
                selectobj._objects.forEach(function(obj){
                    obj.top = -top;
                })
                break
            case 'left':
                selectobj._objects.forEach(function(obj){
                    obj.left = -left;
                })            
                break
            case 'bottom':
                selectobj._objects.forEach(function(obj){
                    obj.top = top - obj.height;
                })
                break
            case 'right':
                selectobj._objects.forEach(function(obj){
                    obj.left = left - obj.width;
                })
                break
            }
            alignmenu.style.display = 'none';
            save();
            //これやらないと文字がぼやける気がする
            selectobj.setCoords();
            canvas.renderAll();
        }
    }

    //複製処理*************************************************************************************
    $('#copy-elements').on('click',function(){
    
        canvas.getActiveObject().clone(function(clonedObj) {
            // 選択フォーカスを非表示に（残るので。。。）
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10, //ちょっとずらして表示
                top: clonedObj.top   + 10, //ちょっとずらして表示
                evented: true,
            });
            //複数選択された場合
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
            //１つのみ選択された場合
                canvas.add(clonedObj);
            }
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
            save();
        });
    })
    
    //削除処理*************************************************************************************
    $('#remove-elements').on('click',function(){
    
        let removeObj = canvas.getActiveObject();   
        //複数選択された場合
        if (removeObj.type === 'activeSelection') {
            removeObj.forEachObject(function(obj) {
                canvas.remove(obj);
            });
        } else {
            //１つのみ選択された場合
            canvas.remove(removeObj);
        }
        // 選択フォーカスを非表示に（残るので。。。）
        canvas.discardActiveObject();
        save();
    })
    //文字列改行処理（改良の余地あり）
    function wrapText (context, text5, maxWidth) {

        let string = '';
        let words = text5.split(' '),
            line = '',
            i,
            test,
            metrics;

        for (i = 0; i < words.length; i++) {
            test = words[i];
            metrics = context.measureText(test);
            while (metrics.width > maxWidth) {
                test = test.substring(0, test.length - 1);
                metrics = context.measureText(test);
            }
            if (words[i] != test) {
                words.splice(i + 1, 0,  words[i].substr(test.length))
                words[i] = test;
            }  
    
            test = line + words[i] + ' ';  
            metrics = context.measureText(test);
            
            if (metrics.width > maxWidth && i > 0) {
                line = words[i] + '\n';
                if (words.length-i != 1){
                    string += words[i] + '\n';
                }else{
                    string += words[i];
                }
            }
            else {
                line = test;
                string = line+ '\n';
            }
        }
        //改行コードを挿入した文章を返す
        return string;
}

    let ctx = document.getElementById('work').getContext('2d'); //隠れキャンバス（作業用）
    let previewmodel  = $('#previewmodel');                     //プレートスタイル設定のプレビュー用ＤＩＶ    
    let wkclass       = previewmodel[0].className.split(' ');   //データベースに保存されていた下記７項目（作業用）
    let fontsize      = wkclass[0];　//フォントサイズ
    let textalign     = wkclass[1];　//センタリング
    let lineheight    = wkclass[2];　//行間
    let textcordinate = wkclass[3];　//太字、イタリック、下線
    let textwidth     = wkclass[4];　//最大幅
    let fontcolor     = wkclass[5];　//フォント色
    let backcolor     = wkclass[6];　//背景色
    let artextAlign   = ['left','center','right'];
    let bold
    let italic
    let underline


    // キャンバスへの何かしらの要素追加
    canvas.on('drop',function(e){
        let leftpos = e.e.layerX - divlayerX;
        let toppos  = e.e.layerY - divlayerY;
        
        if (data != ''){
            let str = data.children[0].textContent;
            // プレート配置
            
            bold      = 'normal';
            italic    = 'noraml';
            underline = false;
            if (textcordinate == 1){bold      = 'bold';}
            if (textcordinate == 2){italic    = 'oblique';}
            if (textcordinate == 3){underline = true;}

            let text6 = new fabric.IText(wrapText(ctx, str, textwidth), { 
                textAlign      : artextAlign[textalign],
                left           : leftpos, 
                top            : toppos,
                fill           : fontcolor,
                fontWeight     : bold,
                // fontStyle      : italic,//現状こちらを有効にした場合スタイルが崩れる（要対応）
                underline      : underline,
                fontFamily     : 'Meiryo UI',//フォントは選択肢増やせ
                fontSize       : fontsize,
                lineHeight     : lineheight,
                backgroundColor: backcolor,
            })
            canvas.add(text6)
            //ホバー時に表示する情報をstylesプロパティに置かせてもらう（ありがとう）
            text6.styles =  {gname: data.dataset.groupname,
                            update: data.dataset.update,
                            create: data.dataset.create
            };
            
        }else if(image != ''){
            //　画像配置
            fabric.Image.fromURL(image.src, function(img) {
                img.set({
                    left: leftpos,
                    top : toppos,
                });
                canvas.add(img);
            });
        }else if(textdata != ''){
               //　テキスト配置
                let texts = new fabric.IText('テキストを入力', { 
                left           : leftpos, 
                top            : toppos,
                fontFamily     : textdata.style.fontFamily,
                fontSize       : 20,
                })
                canvas.add(texts)     
        }
        save();
    });


    // プレートホバー時の詳細情報表示
    let text    = $('#text');
    let group   = $('#group');
    let updated = $('#updated');
    let created = $('#created');

    canvas.on('mouse:over', function (evt) {
        if (evt.target != null && evt.target.styles){
            text.text(evt.target.text);
            group.text(evt.target.styles.gname    ? evt.target.styles.gname : '');
            updated.text(evt.target.styles.update ? evt.target.styles.update: '');
            created.text(evt.target.styles.create ? evt.target.styles.create: '');
        }
    });

    // CSV入力
    $('#import').on('click',function(){
        alert('CSVインポートはまだ実装出来ていません。申し訳ありません。')
    })

    // CSV出力
    $('#export').on('click',function(){
        let aexport = $('#anchorexport');
        aexport[0].click();
    })

    // PDF出力（サイズがおかしい）
    $('#pdfexport').on('click', function () {
        html2canvas(document.getElementById("thecanvas")).then(function(canvas){
            let dataURI = canvas.toDataURL('image/png');
                let pdf = new jsPDF();
                pdf.addImage(dataURI, 'PNG', 10, 10);
                pdf.save('TagPlate.pdf');
        });
    });
    
    //　プレートレイアウト設定（モーダル表示）
    let slidebar1 = $("#slidebar1");
    let slidebar2 = $("#slidebar2");
    let slidebar3 = $("#slidebar3");
    let slidebar4 = $("#slidebar4");
    let slidebarwidth  = $("#slidebarwidth");

    $('.modalsetting').modaal({
        type: 'inline',
        background: 'rgb(80,210,210)',
        content_source: '#settingwindow',
        before_open: function() {
            wkclass.forEach(function(value,index){
                if (index == 0){
                    previewmodel[0].style.fontSize = value + 'px';
                    slidebar3.slider({
                        value:value,
                        min: 10,
                        max: 30,
                        step: 1,
                        change( event, ui ){
                            fontsize = ui.value;
                            previewmodel[0].style.fontSize = ui.value + 'px';
                        }
                    })
                };
                if (index == 1){
                    previewmodel[0].style.textAlign = artextAlign[value];
                    slidebar1.slider({
                        value:value,
                        min: 0,
                        max: 2,
                        step: 1,
                        change( event, ui ){
                            textalign = ui.value;
                            previewmodel[0].style.textAlign = artextAlign[ui.value];
                        }
                    })
                };
                if (index == 2){
                    previewmodel[0].style.lineHeight = value;
                    slidebar2.slider({
                        value:value,
                        min: 1,
                        max: 3,
                        step:0.5,
                        change( event, ui ){
                            lineheight = ui.value;
                            previewmodel[0].style.lineHeight = ui.value;
                        }
                    })
                };
                if (index == 3){
                    stylesetting(value);
                    slidebar4.slider({
                        value:value,
                        min: 0,
                        max: 3,
                        step: 1,
                        change( event, ui ){
                            textcordinate = ui.value;
                            stylesetting(ui.value);
                        }
                    })
                    function stylesetting(value){
                        previewmodel[0].style.fontWeight = 'normal';
                        previewmodel[0].style.fontStyle  = 'normal';
                        previewmodel[0].style.textDecoration = 'none';
                        if (value == 1){previewmodel[0].style.fontWeight = 'bold';}
                        if (value == 2){previewmodel[0].style.fontStyle = 'oblique';}
                        if (value == 3){previewmodel[0].style.textDecoration = 'underline';}
                    }
                };
                if (index == 4){
                    previewmodel[0].style.width = value + 'px';
                    slidebarwidth.slider({
                        value:value,
                        min: 10,
                        max: 300,
                        step: 10,
                        change( event, ui ){
                            textwidth = ui.value;
                            previewmodel[0].style.width = ui.value + 'px';
                        }
                    })
                };
                if (index == 5){
                    $("#font")[0].value = value;
                    previewmodel[0].style.color = value;
                };
                if (index == 6){
                    $("#background")[0].value = value;
                    previewmodel[0].style.background = value;
                };
            })
        },
        before_close:function(){
            //次回レイアウト設定用に各値を保存
            wkclass[0] = fontsize;
            wkclass[1] = textalign;
            wkclass[2] = lineheight;
            wkclass[3] = textcordinate;
            wkclass[4] = textwidth;
            wkclass[5] = fontcolor;
            wkclass[6] = backcolor;
            //次回ログイン時にもレイアウト反映（ＤＢ更新）
            $.ajax({
                url     : "/ajax",
                method  : 'post',
                datatype: 'string',
                data    : wkclass.join(' ')
            })
        }
    });

    //フォントカラー変更
    $("#font").on('change',function(e){
        fontcolor = e.target.value;
        previewmodel[0].style.color = e.target.value;
    });
    //背景色変更
    $("#background").on('change',function(e){
        backcolor = e.target.value;
        previewmodel[0].style.background = e.target.value;
    });

　　//　TagPlateについて説明（モーダル表示）
    $('.modalhelp').modaal({
        type: 'inline',
        background: 'rgb(80,210,210)',
        content_source: '#helpwindow'
    });

    //　ログアウト画面（モーダル表示）
    $('.modallogout').modaal({
        type: 'inline',
        background: 'rgb(80,210,210)',
        content_source: '#logoutwindow'
    });

    let savetologout = $('#savetologout');
    savetologout.on('click',function(){
        savecanvas();
        dologout();
    });

    let logout = $('#dologout');
    logout.on('click',function(){
        dologout();
    });

    function dologout(){
        $.ajax({
            url: "/logout",
            method: 'post',
            processData: false,
            contentType: false
        })
    }
}


// ページタイトル「TagPlate ログイン」用のスクリプト
// ログイン画面・ユーザー登録画面のやつ
function Login(){
    let inputlogin = document.getElementById('inputlogin');
    let inputcreate = document.getElementById('inputcreate');
    let opeclass = 'nonactive';

    $('#questionlogin').on('click',function(e){
        inputlogin.classList.toggle(opeclass);
        inputcreate.classList.toggle(opeclass);
    });
    $('#questioncreate').on('click',function(e){
        inputlogin.classList.toggle(opeclass);
        inputcreate.classList.toggle(opeclass);
    });
}
