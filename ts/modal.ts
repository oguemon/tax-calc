'use strict'

import $ from 'jquery';

const TRANSITION_DURATION = 300;
const BACKDROP_TRANSITION_DURATION = 150;

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
export class Modal {
    private $body;
    private $element;
    private $dialog;
    private $backdrop = null;
    private isShown: boolean;

    constructor (element) {
        this.$body     = $(document.body);
        this.$element  = $(element);
        this.$dialog   = this.$element.find('.modal-dialog');
    }

    // モーダルを表示する
    public show () {
        const that: Modal = this;

        // 既に表示してたら終了
        if (that.isShown) return;

        // 表示してますフラグをオン
        that.isShown = true;

        // bodyにクラス追加
        that.$body.addClass('modal-open');

        // <div data-dismiss="modal">〜</div>を押すと閉じるリスナー設定
        that.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(that.hide, that))

        // バックドロップの処理を実行
        that.backdrop(() => {

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            // モーダルを表示するための処理
            that.$element.show();
            that.$element.scrollTop(0);
            that.$element.addClass('in');

            // ダイアログにアニメーションを伴わせる
            that.emulateTransitionEnd(that.$dialog, TRANSITION_DURATION)
        })
    }

    // モーダルを隠す
    public hide () {
        const that: Modal = this;

        // 既に消していたら終了
        if (!that.isShown) return;

        // 表示してますフラグをオフ
        that.isShown = false;

        // class="in"を消す
        that.$element.removeClass('in');

        // クリックで閉じる系のリスナー解除
        that.$element.off('click.dismiss.bs.modal');

        // モーダルの非表示化
        that.$element.one('transitionend', $.proxy(that.hideModal, that));
        that.emulateTransitionEnd(that.$element, TRANSITION_DURATION);
    }

    // モーダルを隠す
    public hideModal () {
        const that: Modal = this;
        that.$element.hide();

        that.backdrop(() => {
            that.$body.removeClass('modal-open');
        })
    }

    private backdrop (callback) {
        const that: Modal = this;

        // 開く途中に呼ばれたbackdropなら、生成処理を行う
        if (that.isShown) {
            that.$backdrop = $(document.createElement('div'));
            that.$backdrop.addClass('modal-backdrop');
            that.$backdrop.appendTo(that.$body);

            that.$element.on('click.dismiss.bs.modal', $.proxy((e) => {
                if (e.target === e.currentTarget) {
                    that.hide();
                }
            }, that))

            that.$backdrop[0].offsetWidth // force reflow

            that.$backdrop.addClass('in');

            if (!callback) {
                return;
            }

            that.$backdrop.one('transitionend', callback);
            that.emulateTransitionEnd(that.$backdrop, BACKDROP_TRANSITION_DURATION);

        // 閉じる途中に呼ばれたbackdropなら、削除処理を行う
        } else if (!that.isShown && that.$backdrop) {
            that.$backdrop.removeClass('in');

            // バックドロップを消すコールバック関数
            const callbackRemove = () => {
                if (that.$backdrop) {
                that.$backdrop.remove();
                }
                that.$backdrop = null;

                if (callback) {
                callback();
                }
            }

            that.$backdrop.one('transitionend', callbackRemove);
            that.emulateTransitionEnd(that.$backdrop, BACKDROP_TRANSITION_DURATION);
        } else if (callback) {
            callback();
        }
    }

    private emulateTransitionEnd (ele, duration) {
        const that: Modal = this;
        let called: boolean = false;

        ele.one('transitionend', () => {
            called = true
        });

        setTimeout(() => {
            if (!called) {
                ele.trigger('transitionend');
            }
        }, duration);
    }
}

// MODAL PLUGIN DEFINITION
// =======================

const Plugin = function (option) {
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

export default Plugin;
