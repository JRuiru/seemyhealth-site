#!/usr/bin/env python3
"""Generates cta-thumb/scene.rml. Run: python3 -I gen.py <out.rml>"""
import math
import sys

R0 = -math.radians(25)          # resting tilt: points up-left
TAP = (150, 200)                # the tap point, artboard coords
FPS = 60
DUR = 216                       # 3.6 s
TAP_FRAME = 147                 # 2.45 s

EASES = {
    "out": (0, 0, 0.58, 1),
    "in": (0.42, 0, 1, 1),
    "inout": (0.42, 0, 0.58, 1),
}


def kf(frame, value, ease="linear", indent=20):
    pad = " " * indent
    if ease in EASES:
        x1, y1, x2, y2 = EASES[ease]
        return (f'{pad}<KeyFrameDouble frame="{frame}" value="{value:g}" interpolationType="cubic">\n'
                f'{pad}    <CubicEaseInterpolator x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>\n'
                f'{pad}</KeyFrameDouble>')
    return f'{pad}<KeyFrameDouble frame="{frame}" value="{value:g}" interpolationType="{ease}"/>'


def prop(name, keys, indent=16):
    pad = " " * indent
    body = "\n".join(kf(f, v, e, indent + 4) for f, v, e in keys)
    return f'{pad}<KeyedProperty property="{name}">\n{body}\n{pad}</KeyedProperty>'


def obj(oid, props, indent=12):
    pad = " " * indent
    body = "\n".join(prop(n, k, indent + 4) for n, k in props)
    return f'{pad}<KeyedObject objectId="{oid}">\n{body}\n{pad}</KeyedObject>'


r = lambda d: round(R0 + d, 4)

# ---- the Tap timeline -------------------------------------------------------
thumb = [
    ("x", [(0, 680, "out"), (33, 430, "linear"), (111, 430, "inout"),
           (141, TAP[0], "linear"), (168, TAP[0], "in"), (DUR, 680, "linear")]),
    ("y", [(0, 230, "out"),
           (33, 230, "out"), (43, 190, "inout"), (57, 230, "out"), (67, 190, "inout"),
           (81, 230, "inout"), (93, 224, "linear"), (111, 224, "inout"),
           (141, 165, "in"), (TAP_FRAME, TAP[1], "linear"), (150, TAP[1], "out"),
           (168, 180, "in"), (DUR, 250, "linear")]),
    ("rotation", [(0, r(0), "linear"),
                  (33, r(0), "out"), (43, r(-0.09), "inout"), (57, r(0), "out"),
                  (67, r(-0.09), "inout"), (81, r(0), "inout"),
                  (93, r(0.14), "linear"), (105, r(0.14), "inout"),
                  (141, r(0), "linear"), (168, r(0), "in"), (DUR, r(0.12), "linear")]),
    ("scaleX", [(0, 1, "linear"), (141, 1, "in"), (150, 0.94, "out"), (168, 1, "linear")]),
    ("scaleY", [(0, 1, "linear"), (141, 1, "in"), (150, 0.94, "out"), (168, 1, "linear")]),
]
shadow = [
    ("x", [(0, 8, "linear"), (111, 8, "inout"), (141, 13, "in"), (TAP_FRAME, 2, "linear"),
           (150, 2, "out"), (168, 8, "linear")]),
    ("y", [(0, 10, "linear"), (111, 10, "inout"), (141, 16, "in"), (TAP_FRAME, 3, "linear"),
           (150, 3, "out"), (168, 10, "linear")]),
    ("scaleX", [(0, 1, "linear"), (141, 1, "in"), (TAP_FRAME, 0.9, "linear"), (150, 0.9, "out"), (168, 1, "linear")]),
    ("scaleY", [(0, 1, "linear"), (141, 1, "in"), (TAP_FRAME, 0.9, "linear"), (150, 0.9, "out"), (168, 1, "linear")]),
]
burst = [("opacity", [(0, 0, "hold"), (150, 1, "linear"), (154, 1, "out"), (168, 0, "linear")])]

RAY_IDS = [f"0:{30 + i}" for i in range(6)]
ray_keys = [(rid, [("x", [(0, 10, "hold"), (150, 10, "out"), (168, 35, "linear")])]) for rid in RAY_IDS]

tap_objs = [obj("0:10", thumb), obj("0:11", shadow), obj("0:20", burst)] + [obj(i, p) for i, p in ray_keys]

# the tapped trigger, fired by keying the instance value's `fire` callback
tap_objs.append(
    '            <KeyedObject objectId="0:60">\n'
    '                <KeyedProperty property="trigger">\n'
    f'                    <KeyFrameCallback frame="{TAP_FRAME}"/>\n'
    '                </KeyedProperty>\n'
    '            </KeyedObject>')

# ---- the Hidden pose (idle and done) ----------------------------------------
hidden_objs = [
    obj("0:10", [("x", [(0, 680, "hold")]), ("y", [(0, 230, "hold")]),
                 ("rotation", [(0, r(0), "hold")]), ("scaleX", [(0, 1, "hold")]),
                 ("scaleY", [(0, 1, "hold")])]),
    obj("0:20", [("opacity", [(0, 0, "hold")])]),
]

# ---- burst rays --------------------------------------------------------------
rays = []
for i, rid in enumerate(RAY_IDS):
    ang = math.radians(30 + 60 * i)
    rays.append(f'''            <Node rotation="{ang:.4f}" name="Ray {i + 1} Pivot">
                <Shape x="10" name="Ray {i + 1}" id="{rid}">
                    <PointsPath isClosed="false" name="Path">
                        <StraightVertex x="0" y="0"/>
                        <StraightVertex x="9" y="0"/>
                    </PointsPath>
                    <Stroke thickness="3" cap="round" join="round" name="Stroke">
                        <SolidColor colorValue="FFFFFFFF" name="Color"/>
                    </Stroke>
                </Shape>
            </Node>''')

TRIGGER_COND = '''<TransitionViewModelCondition>
                            <TransitionPropertyViewModelComparator>
                                <BindablePropertyTrigger>
                                    <DataBindContext sourcePathIds="0:40-{pid}" propertyKey="686"/>
                                </BindablePropertyTrigger>
                            </TransitionPropertyViewModelComparator>
                            <TransitionValueTriggerComparator/>
                        </TransitionViewModelCondition>'''

nl = "\n"
rml = f'''<Rive version="1" kind="fragment">
    <!--
      CtaThumb: a thumb that has been scrolling, notices "Still scrolling?", and taps the button.

      TAP POINT: artboard (x=150, y=200). The fingertip lands exactly there at 2.45 s
      (frame {TAP_FRAME} at {FPS} fps), when the view model trigger `tapped` fires. The page
      lines this point up with the centre of the HTML store button.

      The Thumb node's origin IS the fingertip (the top of the capsule), so its x/y keys
      are fingertip positions. The artboard has no fill: everything outside the moment is
      transparent, and the thumb rests off the right edge (x=680).

      View model CtaThumb (auto-bound default instance):
        play   (trigger, in)  starts the timeline from the idle pose
        skip   (trigger, in)  from any state, goes to the empty end pose
        tapped (trigger, out) fired by the timeline at 2.45 s
    -->
    <Artboard defaultStateMachineId="0:7" viewModelId="0:40" viewModelInstanceId="0:44"
              styleId="0:3" clip="true" width="600" height="320" name="CtaThumb" id="0:2">
        <LayoutComponentStyle name="Artboard Style" id="0:3"/>

        <!-- Thumb: pivot at the fingertip. Local +y runs down the thumb towards the hand. -->
        <Node x="680" y="230" rotation="{r(0)}" name="Thumb" id="0:10">
            <Shape x="0" y="9" name="Nail">
                <Rectangle originX="0.5" originY="0" width="36" height="42"
                           cornerRadiusTL="16" name="Path"/>
                <Fill name="Fill"><SolidColor colorValue="FFF5F5F4" name="Color"/></Fill>
                <Stroke thickness="1.5" name="Edge"><SolidColor colorValue="FFD6D3D1" name="Color"/></Stroke>
            </Shape>
            <Shape x="0" y="0" name="Knuckle">
                <PointsPath isClosed="false" name="Crease 1">
                    <StraightVertex x="-11" y="96"/>
                    <StraightVertex x="11" y="96"/>
                </PointsPath>
                <PointsPath isClosed="false" name="Crease 2">
                    <StraightVertex x="-7" y="104"/>
                    <StraightVertex x="7" y="104"/>
                </PointsPath>
                <Stroke thickness="2" cap="round" name="Stroke"><SolidColor colorValue="FFD6D3D1" name="Color"/></Stroke>
            </Shape>
            <Shape x="0" y="0" name="Body">
                <Rectangle originX="0.5" originY="0" width="60" height="250"
                           cornerRadiusTL="30" name="Path"/>
                <Fill name="Fill"><SolidColor colorValue="FFE7E5E4" name="Color"/></Fill>
            </Shape>
            <Shape x="8" y="10" name="Shadow" id="0:11">
                <Rectangle originX="0.5" originY="0" width="60" height="250"
                           cornerRadiusTL="30" name="Path"/>
                <Fill fillRule="clockwise" name="Fill">
                    <SolidColor colorValue="59000000" name="Color"/>
                    <Feather strength="6" name="Soft"/>
                </Fill>
            </Shape>
        </Node>

        <!-- Burst: six rays radiating from the tap point, drawn under the thumb. -->
        <Node x="{TAP[0]}" y="{TAP[1]}" opacity="0" name="Burst" id="0:20">
{nl.join(rays)}
        </Node>

        <!-- Internal: the timeline fires this at the tap; the listener below turns it into `tapped`. -->
        <Event name="tap" id="0:60"/>

        <StateMachine name="CtaThumb" id="0:7">
            <StateMachineListenerSingle targetId="0:2" listenerTypeValue="event" eventId="0:60" name="Tap to tapped" id="0:61">
                <ListenerViewModelChange>
                    <BindablePropertyTrigger propertyValue="1">
                        <DataBindContext sourcePathIds="0:40-0:43" propertyKey="686" direction="true"/>
                    </BindablePropertyTrigger>
                </ListenerViewModelChange>
            </StateMachineListenerSingle>
            <StateMachineLayer name="Thumb" id="0:8">
                <AnyState x="160" y="-120" id="0:15">
                    <StateTransition stateToId="0:14">
                        {TRIGGER_COND.format(pid="0:42")}
                    </StateTransition>
                </AnyState>
                <ExitState x="640" y="-120" id="0:16"/>
                <EntryState x="0" y="0" id="0:17">
                    <StateTransition stateToId="0:12"/>
                </EntryState>
                <!-- Idle: nothing visible until `play` -->
                <AnimationState x="160" y="0" animationId="0:50" id="0:12">
                    <StateTransition stateToId="0:13">
                        {TRIGGER_COND.format(pid="0:41")}
                    </StateTransition>
                </AnimationState>
                <!-- Tap: the whole moment, once -->
                <AnimationState x="320" y="0" animationId="0:51" id="0:13">
                    <StateTransition stateToId="0:14" enableExitTime="true"
                                     exitTimeIsPercetange="true" exitTime="100"/>
                </AnimationState>
                <!-- Done: the empty end pose; terminal -->
                <AnimationState x="480" y="0" animationId="0:50" id="0:14"/>
            </StateMachineLayer>
        </StateMachine>

        <LinearAnimation fps="{FPS}" duration="1" name="Hidden" id="0:50">
{nl.join(hidden_objs)}
        </LinearAnimation>

        <LinearAnimation loopValue="oneShot" fps="{FPS}" duration="{DUR}" name="Tap" id="0:51">
{nl.join(tap_objs)}
        </LinearAnimation>
    </Artboard>

    <ViewModel defaultInstanceId="0:44" name="CtaThumb" id="0:40">
        <ViewModelPropertyTrigger name="play" id="0:41"/>
        <ViewModelPropertyTrigger name="skip" id="0:42"/>
        <ViewModelPropertyTrigger name="tapped" id="0:43"/>
        <ViewModelInstance exports="true" name="Default" id="0:44">
            <ViewModelInstanceTrigger viewModelPropertyId="0:41" id="0:45"/>
            <ViewModelInstanceTrigger viewModelPropertyId="0:42" id="0:46"/>
            <ViewModelInstanceTrigger viewModelPropertyId="0:43" id="0:47"/>
        </ViewModelInstance>
    </ViewModel>
</Rive>
'''
open(sys.argv[1], "w").write(rml)
