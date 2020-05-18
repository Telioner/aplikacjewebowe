import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene
{
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private player?: Phaser.Physics.Arcade.Sprite
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private stars?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group

    private score = 0
    private highScore = document.cookie;
    private scoreText?: Phaser.GameObjects.Text;
    private highScoreText?: Phaser.GameObjects.Text;
    private gameOver = false;

	constructor()
	{
		super('hello-world')
	}

    preload ()
    {
        this.load.image('sky', 'background.png')
        this.load.image('ground', 'platform.png')
        this.load.image('logStanding', 'log.png')
        this.load.image('log', 'logGround.png')
        this.load.image('star', 'magicBall.png')
        this.load.image('bomb', 'ball.png')
        this.load.spritesheet('dude', 'dude.png',{ frameWidth: 32, frameHeight: 48 })
    }

    create()
    {
        
        this.add.image(400, 300, 'sky')

        this.platforms = this.physics.add.staticGroup()
        const ground = this.platforms.create(400, 650, 'log') as Phaser.Physics.Arcade.Sprite
        ground
            .setScale(3)
            .setFlipY(true)
            .refreshBody()
        const sky = this.platforms.create(400, -50, 'log') as Phaser.Physics.Arcade.Sprite
        sky
            .setScale(3)
            .refreshBody()             
        const leftBarrier = this.platforms.create(-75,300, 'logStanding') as Phaser.Physics.Arcade.Sprite
        leftBarrier
            .setScale(1.15)
            .refreshBody()
        const rightBarrier = this.platforms.create(875,300, 'logStanding') as Phaser.Physics.Arcade.Sprite
        rightBarrier
            .setScale(1.15)
            .setFlipX(true)
            .refreshBody()
        
        this.player = this.physics.add.sprite(400, 450, 'dude')
        this.player?.setCollideWorldBounds(true)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.platforms)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 90,
            setXY: { x: 82, y: 0, stepX: 7 }
        });

        this.stars.children.iterate(c => {
            const child = c as Phaser.Physics.Arcade.Image
            child.setBounce(Math.random() * (1.01 - 0.99) + 0.99)
            child.setVelocity(Phaser.Math.Between(-600,600), 40)
        
        });

        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.overlap(this.player, this.stars, this.handleCollectStar, undefined, this)

        this.scoreText = this.add.text(50,30, 'Score: 0',{
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Impact, Charcoal, sans-serif'
            
        })
        this.highScoreText = this.add.text(50,60, 'HighScore: '+ this.highScore,{
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'Impact, Charcoal, sans-serif'
            
        })

        this.bombs = this.physics.add.group()

        this.physics.add.collider(this.bombs, this.platforms)
        this.physics.add.collider(this.player, this.bombs, this.handleHitBomb, undefined, this)

        const x = this.player.x < 400
            ? Phaser.Math.Between(400,800)
            : Phaser.Math.Between(0,400)
            const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16, 'bomb')
            bomb.setBounce(1)
            bomb.setCollideWorldBounds(true)
            bomb.setVelocity(Phaser.Math.Between(-200,200), 20)
    }

    private handleHitBomb(player: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject)
    {
        this.physics.pause();

        this.player?.setTint(0xff0000);
    
        this.player?.anims.play('turn');
        if (this.score > Number(this.highScore)){
        this.highScore = this.score.toString();    
        document.cookie = this.score.toString();
        }
        this.gameOver = true;
        alert("Score: " + this.score + " HighScore: " + document.cookie)
        setTimeout(() => { this.score = 0}, 100)
        setTimeout(() => { this.scene.restart() }, 110)
    }
    private handleCollectStar(player: Phaser.GameObjects.GameObject, s: Phaser.GameObjects.GameObject)
    {
        const star = s as Phaser.Physics.Arcade.Image
         star.disableBody(true,true)

        this.score += 10
        this.scoreText?.setText('Score: ' + this.score)
        this.highScoreText?.setText('HighScore: ' + this.highScore)

        if(this.stars?.countActive(true) === 0)
        {
            this.stars.children.iterate(c => {
                const child = c as Phaser.Physics.Arcade.Image
                child.enableBody(true, child.x, 0, true, true)
                child.setVelocity(Phaser.Math.Between(-300,300), 40)
            })

            if (this.player)
            {
                const x = this.player.x < 400
                    ? Phaser.Math.Between(400,800)
                    : Phaser.Math.Between(0,400)
                const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16, 'bomb')
                bomb.setBounce(1)
                bomb.setCollideWorldBounds(true)
                bomb.setVelocity(Phaser.Math.Between(-200,200), 20)
            }          
        }
    }
    update()
    {
        if (!this.cursors)
        {
            return
        }
        if (this.cursors.left?.isDown)
        {
            this.player?.setVelocityX(-320);

            this.player?.anims.play('left', true);
        }
        else if (this.cursors.right?.isDown)
        {
            this.player?.setVelocityX(320);

            this.player?.anims.play('right', true);
        }
        else
        {
            this.player?.setVelocityX(0);

            this.player?.anims.play('turn');
        }

        if (this.cursors.up?.isDown && this.player?.body.touching.down)
        {
            this.player?.setVelocityY(-550);
        }
    }
}
