"use strict";

var NodePoolMode = {
    CONTAINER: 0, // use a container (node) for all object, avoid adding/removing node time by time
    STANDALONE: 1 // self-managed allocation/deallocation for node in memory
};

var NodePool = cc.Class.extend({
    LOGTAG: "[NodePool]",

    ctor: function ctor(creator) {
        var capacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var expandable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        this.creator = creator;
        this.capacity = capacity;
        this.expandable = expandable;

        this.isAutoShrink = false;
        this.shrinkOffset = 10;
        this.baseCapacity = capacity;

        this.mode = NodePoolMode.CONTAINER;
        this.list = [];
    },

    /**
     * Indicates if the pool if full of capacity
     * @returns {boolean}
     */
    isFull: function isFull() {
        return this.list.length >= this.capacity;
    },

    /**
     * Indicates if pool is empty
     * @returns {boolean}
     */
    isEmpty: function isEmpty() {
        return this.list.length <= 0;
    },

    getMode: function getMode() {
        return this.mode;
    },

    setMode: function setMode(value) {
        this.mode = value;
    },

    /**
     * Indicates if pool will auto shrink to its original capacity
     * @param value
     */
    setAutoShrink: function setAutoShrink(value, offset) {
        this.isAutoShrink = value;
        if (offset) {
            this.shrinkOffset = offset;
        }
    },

    /**
     * Init nodes in pool with original capacity
     */
    init: function init() {
        for (var i = 0; i < this.capacity; i++) {
            var entity = this.creator && cc.isFunction(this.creator) ? this.creator() : null;
            if (entity) {
                this.push(entity, true);
            }
        }
    },

    /**
     * Total count of nodes in pool
     * @returns {number}
     */
    count: function count() {
        return this.list.length;
    },

    /**
     * Total count of nodes are being used
     * @returns {*}
     */
    usedCount: function usedCount() {
        return this.list.reduce(function (total, item) {
            return total + (item.isUsed === true ? 1 : 0);
        }, 0);
    },

    /**
     * Total count of available to used nodes
     * @returns {*}
     */
    leftCount: function leftCount() {
        return this.list.reduce(function (total, item) {
            return total + (item.isUsed === true ? 0 : 1);
        }, 0);
    },

    /**
     * Return a node to pool
     * @param entity
     * @param init
     */
    push: function push(entity) {
        var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!(entity instanceof cc.Node)) return;

        entity.isUsed = false;
        entity.setVisible(false);

        if (this.mode === NodePoolMode.CONTAINER && entity.owner) NodeUtils.switchParent(entity, entity.owner);

        if (init) {

            // get owner when init (standalone mdoe)
            if (this.mode === NodePoolMode.CONTAINER) entity.owner = entity.getParent();else entity.retain();

            this.list.push(entity);
        } else if (this.isAutoShrink && this.list.length > this.baseCapacity + this.shrinkOffset && this.leftCount() > this.shrinkOffset) {

            // only shrink when push node after use
            this.shrinkBy(this.shrinkOffset);
        }
    },

    /**
     * Get a free node from pool
     * @returns {null|*}
     */
    pull: function pull() {

        for (var i = 0; i < this.list.length; i++) {
            var entity = this.list[i];
            if (entity.isUsed === false) {
                entity.isUsed = true;
                return entity;
            }
        }

        if (!this.isFull() || this.expandable) {

            var _entity = this.creator && cc.isFunction(this.creator) ? this.creator() : null;
            if (_entity) {
                this.push(_entity, true);
                if (this.isFull()) this.capacity++;
            }

            _entity.isUsed = true;
            return _entity;
        }

        cc.log(this.LOGTAG, "pull", "No entity left in pool!");
        return null;
    },

    /**
     * Revoke all nodes in pool
     */
    revoke: function revoke() {
        var _this = this;

        this.list.forEach(function (entity) {
            _this.push(entity);
        });
    },

    /**
     * Release a number of un-used nodes in pool
     * @param count Count of nodes to remove
     * @returns {number} Return actual removed nodes count
     */
    shrinkBy: function shrinkBy(count) {

        var index = 0;
        var entity = null;
        var removeCount = Math.min(this.list.length, count);
        while (index < this.list.length && removeCount > 0) {
            entity = this.list[index];
            if (entity.isUsed === false) {
                this.list.splice(index, 1);
                this.removeEntity(entity, this.mode === NodePoolMode.STANDALONE);
                removeCount--;
                continue;
            }
            index++;
        }

        this.capacity = this.list.length;
        return count - removeCount;
    },

    /**
     * Compact pool to target capacity by releasing un-used nodes
     * @param count Target size of pool
     * @returns {number} Actual size of pool after shrinking
     */
    shrinkTo: function shrinkTo(count) {

        if (count <= 0 || count >= this.list.length) return this.list.length;

        var index = 0;
        var entity = null;
        while (index < this.list.length && this.list.length > count) {
            entity = this.list[index];
            if (entity.isUsed === false) {
                this.list.splice(index, 1);
                this.removeEntity(entity, this.mode === NodePoolMode.STANDALONE);
                continue;
            }
            index++;
        }

        this.capacity = this.list.length;
        return this.list.length;
    },

    /**
     * Compact pool to its original capacity
     * @returns {number} Actual size of pool after shrinking
     */
    shrinkToBase: function shrinkToBase() {
        return this.shrinkTo(this.baseCapacity);
    },

    /**
     * Remove entity from parent with cleanup
     * @param entity
     * @param release
     */
    removeEntity: function removeEntity(entity) {
        var release = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (entity.getParent() !== null) entity.removeFromParent();
        if (release) entity.release();
    },

    /**
     * Release all nodes in pool from memory (used in STANDALONE mode)
     */
    clear: function clear() {
        this.list.forEach(function (entity) {
            return entity.release();
        });
        this.list.splice(0, this.list.length);
    }
});