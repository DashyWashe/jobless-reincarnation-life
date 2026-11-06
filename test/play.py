import asyncio, sys, random
from playwright.async_api import async_playwright
URL = 'file:///home/claude/jr/dist/jobless-reincarnation.html'
SH = '/home/claude/jr/shots/'
async def main(scheme):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, color_scheme=scheme, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        page.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        await page.goto(URL); await page.wait_for_timeout(1200)
        await page.screenshot(path=SH + f'{scheme}_1_title.png')
        await page.click('[data-a=newlife]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SH + f'{scheme}_2_create.png', full_page=True)
        await page.click('.create-go [data-a=begin]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SH + f'{scheme}_3_life.png')
        async def handle_events():
            for _ in range(8):
                if await page.locator('.sh-event').count():
                    await page.wait_for_timeout(50)
                    ch = page.locator('.sh-event .choice:not([disabled])')
                    if await ch.count() == 0: break
                    await ch.nth(random.randrange(await ch.count())).click(); await page.wait_for_timeout(80)
                    if await page.locator('[data-a=evcontinue]').count(): await page.click('[data-a=evcontinue]'); await page.wait_for_timeout(60)
                else: break
        shot_event = False
        for yr in range(45):
            if await page.locator('.death').count(): break
            if await page.locator('.sh-event').count() and not shot_event and yr > 3:
                await page.screenshot(path=SH + f'{scheme}_5_event.png'); shot_event = True
            await handle_events()
            # do actions in train tab
            await page.click('[data-a=tab][data-v=train]'); await page.wait_for_timeout(50)
            for _ in range(4):
                btns = page.locator('#tabbody button.btn[data-a=mana]:not([disabled]), #tabbody button.btn[data-a=magic]:not([disabled]), #tabbody button.btn[data-a=sword]:not([disabled]), #tabbody button.btn[data-a=aura]:not([disabled]), #tabbody button.btn[data-a=study]:not([disabled]), #tabbody button.btn[data-a=trial]:not([disabled])')
                n = await btns.count()
                if n == 0: break
                await btns.nth(random.randrange(n)).click(); await page.wait_for_timeout(40)
                await handle_events()
            if yr == 6: await page.screenshot(path=SH + f'{scheme}_4_train.png', full_page=False)
            # social
            await page.click('[data-a=tab][data-v=people]'); await page.wait_for_timeout(40)
            if yr == 9: await page.screenshot(path=SH + f'{scheme}_6_people.png')
            mf = page.locator('[data-a=meet]:not([disabled])')
            if await mf.count(): await mf.first.click(); await page.wait_for_timeout(40)
            await handle_events()
            await page.click('[data-a=tab][data-v=work]'); await page.wait_for_timeout(40)
            ap = page.locator('[data-a=apply]:not([disabled])')
            if await ap.count(): await ap.first.click(); await page.wait_for_timeout(40)
            if yr == 16: await page.screenshot(path=SH + f'{scheme}_7_work.png')
            await page.click('[data-a=tab][data-v=life]'); await page.wait_for_timeout(40)
            if await page.locator('.death').count(): break
            await page.click('[data-a=age]'); await page.wait_for_timeout(120)
            await handle_events()
        dead = await page.locator('.death').count()
        print('dead early:', bool(dead), 'errors so far:', errs[:10])
        if dead:
            await page.screenshot(path=SH + f'{scheme}_13_death.png', full_page=True)
            await page.click('[data-a=newlife]'); await page.wait_for_timeout(300)
            await page.click('.create-go [data-a=begin]'); await page.wait_for_timeout(300)
        await page.click('[data-a=tab][data-v=world]'); await page.wait_for_timeout(100)
        await page.screenshot(path=SH + f'{scheme}_8_world.png')
        await page.click('[data-a=tab][data-v=life]'); await page.wait_for_timeout(100)
        await page.screenshot(path=SH + f'{scheme}_9_life_late.png')
        await page.click('[data-a=sheet][data-type=menu]'); await page.wait_for_timeout(200)
        await page.screenshot(path=SH + f'{scheme}_10_menu.png')
        await page.click('.mrow[data-type=admin]'); await page.wait_for_timeout(200)
        await page.screenshot(path=SH + f'{scheme}_11_admin.png')
        await page.click('[data-a=adsec][data-v=traits]'); await page.wait_for_timeout(150)
        await page.screenshot(path=SH + f'{scheme}_12_admin_traits.png')
        await page.click('.sheet-x'); await page.wait_for_timeout(100)
        await page.click('[data-a=sheet][data-type=menu]'); await page.wait_for_timeout(150)
        await page.click('.mrow[data-c=endlife]'); await page.wait_for_timeout(150)
        await page.click('[data-a=yes]'); await page.wait_for_timeout(1500)
        await page.screenshot(path=SH + f'{scheme}_13_death.png', full_page=True)
        # horizontal overflow check
        ow = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        print(scheme, 'overflow-x:', ow)
        print('\n'.join(errs[:15]) or 'no errors')
        await b.close()
asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'dark'))
