'use strict';

import jquery from 'jquery';

const $: any = jquery;

// CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
// ============================================================
function transitionEnd() {
    // テキトーな要素を作る
    var el = document.createElement('check');

    var transEndEventNames = {
        WebkitTransition : 'webkitTransitionEnd',
        MozTransition    : 'transitionend',
        OTransition      : 'oTransitionEnd otransitionend',
        transition       : 'transitionend'
    };

    for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
            return { end: transEndEventNames[name] };
        }
    }

    return false;
}

$.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () { called = true });

    var callback = function () {
    if (!called) {
        $($el).trigger($.support.transition.end);
    }
    };
    setTimeout(callback, duration);

    return this;
}

$(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
        bindType: $.support.transition.end,
        delegateType: $.support.transition.end,
        handle: function (e) {
            if ($(e.target).is(this)) {
                return e.handleObj.handler.apply(this, arguments);
            }
        }
    }
})

/* ============================================================
    簡単モーダルクラス（modal.cssも要ります）

    $('パネルのセレクター').modal('show') : モーダル表示
    $('パネルのセレクター').modal('hide') : モーダル閉じる
    $('パネルのセレクター').modal() : モーダル表示

    パネルのHTML
    <div class="modal" id="パネルのセレクター">
        <div class="modal-dialog">
        好きなこと
        </div>
    </div>

    閉じるボタン
    <div data-dismiss="modal">閉じるボタン</div>
    ============================================================*/
export const Modal: any = function (element) {
    this.$body     = $(document.body);
    this.$element  = $(element);
    this.$dialog   = this.$element.find('.modal-dialog');
    this.$backdrop = null;
    this.isShown   = null;
}

Modal.TRANSITION_DURATION = 300;
Modal.BACKDROP_TRANSITION_DURATION = 150;

// モーダルを表示する
Modal.prototype.show = function () {
    const that = this;

    // 既に表示してたら終了
    if (this.isShown) return;

    // 表示してますフラグをオン
    this.isShown = true;

    // bodyにクラス追加
    this.$body.addClass('modal-open');

    // <div data-dismiss="modal">〜</div>を押すと閉じるリスナー設定
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    // バックドロップの処理を実行
    this.backdrop(function () {

    if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
    }

    // モーダルを表示するための処理
    that.$element.show();
    that.$element.scrollTop(0);
    that.$element.addClass('in');

    // ダイアログにアニメーションを伴わせる
    that.$dialog.emulateTransitionEnd(Modal.TRANSITION_DURATION)
    })
}

// モーダルを隠す
Modal.prototype.hide = function () {

    // 既に消していたら終了
    if (!this.isShown) return;

    // 表示してますフラグをオフ
    this.isShown = false;

    // class="in"を消す
    this.$element.removeClass('in');

    // クリックで閉じる系のリスナー解除
    this.$element.off('click.dismiss.bs.modal');

    // アニメーションができそうなら
    if ($.support.transition) {
        this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this));
        this.$element.emulateTransitionEnd(Modal.TRANSITION_DURATION);
    } else {
        // とりまモーダル消す
        this.hideModal();
    }
}

// モーダルを隠す
Modal.prototype.hideModal = function () {
    const that = this;
    this.$element.hide();

    this.backdrop(function () {
        that.$body.removeClass('modal-open');
    })
}

Modal.prototype.backdrop = function (callback) {
    const that = this;

    // 開く途中に呼ばれたbackdropなら、生成処理を行う
    if (this.isShown) {
        var doAnimate = $.support.transition;

        this.$backdrop = $(document.createElement('div'));
        this.$backdrop.addClass('modal-backdrop');
        this.$backdrop.appendTo(this.$body);

        this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
            if (e.target !== e.currentTarget) return;
            this.hide();
        }, this))

        if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

        this.$backdrop.addClass('in');

        if (!callback) return

        if (doAnimate) {
            this.$backdrop.one('bsTransitionEnd', callback);
            this.$backdrop.emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION);
        } else {
            callback();
        }

    // 閉じる途中に呼ばれたbackdropなら、削除処理を行う
    } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass('in');

        // バックドロップを消すコールバック関数
        var callbackRemove = function () {
            if (that.$backdrop) {
            that.$backdrop.remove();
            }
            that.$backdrop = null;

            if (callback) {
            callback();
            }
        }

        if ($.support.transition) {
            this.$backdrop.one('bsTransitionEnd', callbackRemove);
            this.$backdrop.emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION);
        } else {
            callbackRemove();
        }
    } else if (callback) {
    callback();
    }
}

// MODAL PLUGIN DEFINITION
// =======================

export function Plugin(option) {
    return this.each(function () {

        // bs.modalデータがなければ新規作成して設定
        if (!$(this).data('bs.modal')) {
            $(this).data('bs.modal', new Modal(this));
        }

        // bs.modalデータを代入
        const data = $(this).data('bs.modal');

        // 引数に応じて処理するメソッドを決める
        if (typeof option == 'string') {
            data[option]();
        } else {
            data.show();
        }
    });
}

// 以下を呼び出し元処理で呼び出す
// $.fn.modal             = Plugin;
// $.fn.modal.Constructor = Modal;
