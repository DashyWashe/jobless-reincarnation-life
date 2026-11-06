import asyncio, sys, random
from playwright.async_api import async_playwright
URL = 'file:///home/claude/jr/dist/preview.html'
SH = '/home/claude/jr/shots/'

async def run(scheme, w, h, tag, years=24, phone=False, theme=None):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'], ignore_default_args=['--hide-scrollbars'])
        ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, color_scheme=scheme, has_touch=phone, is_mobile=phone)
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        page.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text and 'ERR_' not in m.text else None)
        await page.goto(URL); await page.wait_for_timeout(1200)
        async def overflow(where):
            ov = await page.evaluate('() => [document.documentElement.scrollWidth, window.innerWidth]')
            if ov[0] > ov[1] + 1: errs.append(f'H-OVERFLOW at {where}: {ov}')
        await page.screenshot(path=SH + f'{tag}_01_title.png'); await overflow('title')
        await page.click('[data-a=newlife]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SH + f'{tag}_02_create.png'); await overflow('create')
        # creation interactions
        if not phone:
            await page.click('[data-a=cstep][data-v=appearance]'); await page.wait_for_timeout(250)
            await page.click('.stylecard >> nth=4'); await page.wait_for_timeout(150)
            await page.screenshot(path=SH + f'{tag}_03_create_look.png')
            await page.click('[data-a=cstep][data-v=fate]'); await page.wait_for_timeout(250)
            await page.click('[data-a=reroll]'); await page.wait_for_timeout(700)
            await page.hover('.tcard >> nth=0'); await page.wait_for_timeout(400)
            await page.screenshot(path=SH + f'{tag}_04_create_fate_tip.png')
            if w >= 1280: await page.click('[data-a=previewage][data-v=adult]'); await page.wait_for_timeout(150)
        await overflow('create2')
        await page.click('.create-go [data-a=begin]'); await page.wait_for_timeout(400)
        if theme:
            await page.click('.nav [data-a=page][data-v=settings]'); await page.wait_for_timeout(150)
            await page.click(f'[data-a=set][data-k=theme][data-v={theme}]'); await page.wait_for_timeout(150)
            await page.click('.nav [data-a=page][data-v=overview]'); await page.wait_for_timeout(150)
        await page.screenshot(path=SH + f'{tag}_05_overview.png'); await overflow('overview')
        if w >= 1280:
            await page.hover('.side .tchip >> nth=0'); await page.wait_for_timeout(450)
            await page.screenshot(path=SH + f'{tag}_06_trait_tip.png')
        async def events(shot=None):
            for _ in range(10):
                if await page.locator('.m-event').count():
                    await page.wait_for_timeout(50)
                    t = page.locator('.ev-text')
                    if await t.count(): await t.click()
                    await page.wait_for_timeout(60)
                    if shot: await page.screenshot(path=SH + shot); shot = None
                    ch = page.locator('.m-event .choice:not([disabled])')
                    n = await ch.count()
                    if not n: break
                    await ch.nth(random.randrange(n)).click(); await page.wait_for_timeout(80)
                if await page.locator('[data-a=evcontinue]').count():
                    if shot: await page.screenshot(path=SH + shot); shot = None
                    await page.click('[data-a=evcontinue]'); await page.wait_for_timeout(60)
                if not await page.locator('.m-event').count(): break
        async def nav(pg):
            if phone and not await page.evaluate("() => !!document.querySelector('.shell.nav-open')"):
                await page.click('.mbar [data-a=navtoggle]'); await page.wait_for_timeout(280)
            await page.click(f'.nav [data-a=page][data-v={pg}]'); await page.wait_for_timeout(120)
        ev_shot = False
        for yr in range(years):
            if await page.locator('.death').count(): break
            await events(None if ev_shot or yr < 3 else f'{tag}_07_event.png')
            if yr >= 3: ev_shot = True
            for pg in ['mana', 'magic', 'sword', 'activities']:
                if await page.locator('.death').count(): break
                await nav(pg)
                for _ in range(3):
                    btns = page.locator('.center .btn:not([disabled])[data-a=mana][data-push="0"], .center .btn:not([disabled])[data-a=magic], .center .btn:not([disabled])[data-a=sword], .center .btn:not([disabled])[data-a=trial], .center .btn:not([disabled])[data-a=activity]')
                    n = await btns.count()
                    if not n: break
                    await btns.nth(random.randrange(n)).click(); await page.wait_for_timeout(40)
                    await events()
            if yr == 6: await page.screenshot(path=SH + f'{tag}_08_magic.png')
            if await page.locator('.death').count(): break
            await nav('relations')
            mf = page.locator('.center [data-a=meet]:not([disabled])')
            if await mf.count(): await mf.first.click(); await page.wait_for_timeout(60)
            await events()
            if await page.locator('.death').count(): break
            if phone: await page.click('.mbar .agebtn')
            else: await page.keyboard.press('Space')
            await page.wait_for_timeout(120)
        await events()
        if not await page.locator('.death').count():
            for i, pg in enumerate(['overview', 'family', 'relations', 'arcs', 'goals', 'achievements', 'aura', 'body', 'work', 'school', 'guild', 'market', 'location', 'travel', 'powers', 'codex', 'compendium', 'hall', 'shop', 'settings', 'admin', 'journal']):
                await nav(pg); await page.wait_for_timeout(120)
                await overflow(pg)
                if pg == 'family':
                    pa = page.locator('.center .pacc .acc-bar')
                    if await pa.count(): await pa.first.click(); await page.wait_for_timeout(150)
                if pg == 'journal':
                    lp = page.locator('.lc-area')
                    if await lp.count():
                        bb = await lp.bounding_box()
                        if bb: await page.mouse.click(bb['x'] + bb['width'] * .5, bb['y'] + bb['height'] * .5); await page.wait_for_timeout(120)
                        tip_on = await page.evaluate("() => { const t = document.querySelector('.lc-tip'); return !!t && !t.hidden; }")
                        print(tag, 'chart tooltip shown:', tip_on)
                if pg in ('overview', 'family', 'arcs', 'goals', 'market', 'codex', 'settings', 'journal', 'travel', 'work', 'compendium', 'hall') or not phone:
                    await page.screenshot(path=SH + f'{tag}_1{i:02d}_{pg}.png')
            if phone:
                await page.click('.mbar [data-a=sidetoggle]'); await page.wait_for_timeout(350)
                await page.screenshot(path=SH + f'{tag}_90_side.png')
                await page.mouse.click(8, 420); await page.wait_for_timeout(300)
                await page.click('.mbar [data-a=navtoggle]'); await page.wait_for_timeout(350)
                await page.screenshot(path=SH + f'{tag}_91_nav.png')
                await page.mouse.click(8, 420); await page.wait_for_timeout(300)
            # admin console tour
            await nav('admin'); await page.wait_for_timeout(150)
            for i, tab in enumerate(['cheats', 'character', 'stats', 'skills', 'traits', 'people', 'world', 'career', 'items', 'story', 'events', 'legacy', 'inspect']):
                await page.click(f'.adm-tabs [data-v={tab}]'); await page.wait_for_timeout(120)
                await overflow('admin-' + tab)
                if tab == 'cheats':
                    await page.click('[data-a=adcheat][data-k=infAp]'); await page.wait_for_timeout(100)
                    await page.select_option('select[data-a2=adcheatsel][data-k=xp]', '5'); await page.wait_for_timeout(100)
                if tab == 'traits':
                    await page.fill('[data-filter="#adm-traits"]', 'mana'); await page.wait_for_timeout(100)
                    vis = await page.evaluate("() => [...document.querySelectorAll('#adm-traits > .row')].filter(r => !r.hidden).length")
                    print(tag, 'trait search "mana" rows:', vis)
                if tab == 'people':
                    await page.click('[data-a=adcanon]'); await page.wait_for_timeout(120)
                    await page.click('[data-a=adspawn]'); await page.wait_for_timeout(120)
                if tab == 'legacy':
                    await page.click('[data-a=adlp][data-n="10000"]'); await page.wait_for_timeout(100)
                if tab == 'story':
                    await page.click('[data-a=adskip][data-n="5"]'); await page.wait_for_timeout(300)
                    if await page.locator('.death').count(): break
                if not phone or tab in ('cheats', 'people', 'legacy'):
                    await page.screenshot(path=SH + f'{tag}_2{i:02d}_admin_{tab}.png')
            if not await page.locator('.death').count():
                await nav('shop'); await page.wait_for_timeout(150)
                await page.click('[data-a=shopf][data-v=afford]'); await page.wait_for_timeout(120)
                bb = page.locator('.center [data-a=buy]:not([disabled])')
                if await bb.count(): await bb.first.click(); await page.wait_for_timeout(150)
                await page.click('[data-a=shopf][data-v=all]'); await page.wait_for_timeout(120)
                await page.screenshot(path=SH + f'{tag}_30_shop.png'); await overflow('shop')
                if not phone:
                    await page.hover('.center .row.upg b >> nth=3'); await page.wait_for_timeout(450)
                    await page.screenshot(path=SH + f'{tag}_31_shop_tip.png')
            sb = await page.evaluate("() => { const e = document.getElementById('cscroll'); return e ? [e.scrollHeight, e.clientHeight, e.offsetWidth - e.clientWidth] : null }")
            print(tag, 'center scroll [scrollH, clientH, scrollbarW]:', sb)
            await page.evaluate("() => { const b = document.querySelector('[data-a=confirm][data-c=endlife]'); b && b.click(); }"); await page.wait_for_timeout(250)
            await page.click('[data-a=yes]'); await page.wait_for_timeout(1500)
        await page.screenshot(path=SH + f'{tag}_99_death.png', full_page=True); await overflow('death')
        print(tag, 'errors:', len(errs)); [print('  ', e) for e in errs[:12]]
        await b.close()

async def main():
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if which in ('all', 'desk'): await run('dark', 1440, 900, 'd1440')
    if which in ('all', 'mid'): await run('light', 1180, 800, 'm1180', years=10, theme='parchment')
    if which in ('all', 'phone'): await run('dark', 390, 844, 'p390', years=10, phone=True)
asyncio.run(main())
