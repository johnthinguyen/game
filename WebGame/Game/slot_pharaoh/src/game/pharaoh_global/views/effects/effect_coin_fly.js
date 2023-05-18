Module.define(function (require) {
    "use strict";

    const Particle = cc.Sprite.extend({
        ctor: function (animate) {
            this._super();

            this.velX = 0;
            this.velY = 0;
            this.aclX = 0;
            this.aclY = 0;
            this.rotation = Math.random() * 360;

            this.runAction(animate);

            return true;
        },

        startAnimation: function (x, y, velX, velY, aclX, aclY) {
            this.x = x;
            this.y = y;
            this.velX = velX;
            this.velY = velY;
            this.aclX = aclX;
            this.aclY = aclY;

            this.visible = true;
            this.scheduleUpdate();
        },

        stopAnimation: function () {
            this.visible = false;
            this.unscheduleUpdate();
        },

        update: function (dt) {
            this.x += this.velX * dt;
            this.y += this.velY * dt;
            this.velX += this.aclX * dt;
            this.velY += this.aclY * dt;
            this.rotation += 45 * dt;
            if (this.y <= -this.getContentSize().height) {
                this.stopAnimation();
            }
        }
    });

    const CoinFlyEffect = cc.Layer.extend({
        animate: null,

        ctor: function (animate, particles, particlePerSpawn, spawnInterval) {
            this._super();

            this.animate = animate.clone();
            this.animate.retain();

            this.currentParticle = 0;
            this.particles = Array.from({length: particles}, () => {
                let node = new Particle(animate.clone());
                node.visible = false;
                this.addChild(node);
                return node;
            });
            this.particlePerSpawn = particlePerSpawn;
            this.spawnInterval = spawnInterval;

            this.spawnTimer = 0;

            let size = this.getContentSize();
            this.setSpawnMotivations({
                position: cc.p(size.width * 0.5, 0.0),
                startSpeed: 700,
                endSpeed: 1000,
                gravity: -600,
                startAngle: Math.PI * 0.4,
                endAngle: Math.PI * 0.6,
            });

            this.scheduleUpdate();
        },

        coinFlyUnSche: function(){
            this.unscheduleUpdate();
        },

        coinFlySche: function () {
            this.scheduleUpdate();
        },

        update: function (dt) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer -= this.spawnInterval;
                for (let i = 0; i < this.particlePerSpawn; i++) {
                    let index = this.currentParticle = (this.currentParticle + 1) % this.particles.length;
                    let node = this.particles[index];

                    if (!node.visible) {
                        let mov = this.getSpawnMotivation();
                        let angle = mov.startAngle + Math.random() * (mov.endAngle - mov.startAngle);
                        let speed = mov.startSpeed + Math.random() * (mov.endSpeed - mov.startSpeed);
                        node.startAnimation(mov.position.x, mov.position.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 0, mov.gravity);
                        node.stopAllActions();
                        node.runAction(this.animate.clone());
                        node.scale = 0.8 + Math.random() * 0.2;
                    }
                }
            }
        },

        setSpawnMotivations: function (motivations) {
            this.spawnMotivations = motivations;
        },

        getSpawnMotivation: function () {
            if (this.spawnMotivations instanceof Array) {
                return this.spawnMotivations[MathUtils.randomMinMax(0, this.spawnMotivations.length - 1)];
            } else {
                return this.spawnMotivations;
            }
        }
    });

    window.CoinFlyEffect = CoinFlyEffect;
    return CoinFlyEffect;
});